import {
	type StandardMaterial,
	Vector3,
	Mesh,
	MeshBuilder,
	SceneLoader,
	AbstractMesh,
	Animation,
	ActionManager,
	ExecuteCodeAction,
	Axis,
	Space,
	AnimationGroup,
} from '@babylonjs/core'
import type { ChairConfig, Scene } from '@/client/types/business'
import { MeshRoomEnum, type MeshRoomList } from '@/client/types/meshes'
import { degToRad } from '@/client/utils/converter'
import { DUMMY_KEY } from '@/constants'
import { getMaterial } from './materials'

const DISTANCE_HELPERS = 1

// Helpers
const materials = getMaterial()

const MESHES_REPOSITORY = '../../assets/meshes/'

const MESH_ROOM: MeshRoomList = {
	PROTOTYPE_01: {
		name: 'meeting-room-v2.obj',
		funct: (meshes: AbstractMesh[], scene: Scene) => {
			meshes.forEach((meshe) => {
				meshe.position = new Vector3(-100, -1, 100)
				meshe.scaling.scaleInPlace(10)
				if (meshe.name === 'Floor') meshe.material = materials.woodDark(scene)
			})
		},
	},
	PROTOTYPE_02: {
		name: 'prototype-2-texture&door.gltf',
		funct: (meshes: AbstractMesh[]) => {
			meshes.forEach((meshe) => {
				if (meshe.name !== '__root__') return
				meshe.position.x += 18
				meshe.position.y += -0.7
				meshe.position.z += 17
				meshe.scaling.scaleInPlace(1.15)
			})
		},
	},
	PROTOTYPE_02_NOTEXTURE: {
		name: 'prototype-2-notexture&door.gltf',
		funct: (meshes: AbstractMesh[]) => {
			meshes.forEach((meshe) => {
				if (meshe.name !== '__root__') return
				meshe.position.x += 15
				meshe.position.y += -0.5
				meshe.position.z += 15
			})
		},
	},
}

export function getMesh() {
	const tableMediation = (
		scene: Scene,
		texture: StandardMaterial,
		numberOfPeople: number
	): number => {
		const size = 1
		let tableSize = 6

		if (numberOfPeople > 4) {
			tableSize += (numberOfPeople - 4) * 2
		}

		const tableTopOrigin = new Vector3(0, 2.6, 0)
		const tableTop: Mesh = MeshBuilder.CreateCylinder(
			'tableTop',
			{ diameter: tableSize, height: 0.2 },
			scene
		)

		const tableLegOrigin = new Vector3(0, 1.3, 0)
		const tableLeg: Mesh = MeshBuilder.CreateCylinder(
			'tableLeg',
			{ diameter: 0.5 * size, height: 2.5 },
			scene
		)

		const tableBottomOrigin = new Vector3(0, 0.05, 0)
		const tableBottom: Mesh = MeshBuilder.CreateCylinder(
			'tableBottom',
			{ diameter: 2.5 * size, height: 0.1 },
			scene
		)

		tableTop.material = texture
		tableTop.position = tableTopOrigin

		//tableLeg.material = texture;
		tableLeg.position = tableLegOrigin

		//tableBottom.material = texture;
		tableBottom.position = tableBottomOrigin

		return tableSize / 2
	}

	return {
		tableMediation,
	}
}

export function loadMesh() {
	const dummyAvatar = (scene: Scene) => {
		SceneLoader.ImportMesh(
			'',
			MESHES_REPOSITORY,
			'dummy3.babylon',
			scene,
			(meshes) => {
				// console.log(meshes)
				meshes.forEach((mesh) => {
					if (mesh.name === 'YBot') return
					mesh.scaling.scaleInPlace(3.6)
				})
			}
		)
	}

	const dummyAvatarAroundTable = (scene: Scene, config: ChairConfig) => {
		SceneLoader.ImportMesh(
			'',
			MESHES_REPOSITORY,
			'dummy3.babylon',
			scene,
			(meshes, _ps, skeletons) => {
				meshes.forEach((mesh) => {
					if (mesh.name === 'YBot') return
					mesh.scaling.scaleInPlace(3.6)
					mesh.position = new Vector3(
						(config.tableRayon + DISTANCE_HELPERS) *
							Math.cos(degToRad((360 / config.membersNumber) * config.order)),
						-1.4,
						(config.tableRayon + DISTANCE_HELPERS) *
							Math.sin(degToRad((360 / config.membersNumber) * config.order))
					)
					mesh.rotation = new Vector3(
						0,
						degToRad((-360 / config.membersNumber) * config.order - 90),
						0
					)
				})
				skeletons.forEach((skeleton) => {
					if (skeleton.name === DUMMY_KEY.MESHES.SKIN) {
						skeleton.bones.forEach((bone) => {
							if (
								bone.name === DUMMY_KEY.BONES.RIGHT_UP_LEG ||
								bone.name === DUMMY_KEY.BONES.LEFT_UP_LEG
							)
								bone.rotate(Axis.X, degToRad(-90))
							if (
								bone.name === DUMMY_KEY.BONES.RIGHT_LEG ||
								bone.name === DUMMY_KEY.BONES.LEFT_LEG
							)
								bone.rotate(Axis.X, degToRad(90))
							if (bone.name === DUMMY_KEY.BONES.NECK)
								bone.rotate(Axis.X, degToRad(160))
						})
					}
				})
			}
		)
	}

	const mediationRoom = (
		scene: Scene,
		meshRoom: MeshRoomEnum = MeshRoomEnum.PROTOTYPE_01
	) => {
		const keys: Array<{ frame: number; value: number }> = []
		keys.push({ frame: 0, value: 0 })
		keys.push({ frame: 40, value: degToRad(90) })

		SceneLoader.ImportMesh(
			'',
			MESHES_REPOSITORY,
			MESH_ROOM[meshRoom].name,
			scene,
			(meshes) => {
				MESH_ROOM[meshRoom].funct(meshes, scene)

				const door: { interior?: Mesh; glass?: Mesh; handle?: Mesh } = {}
				meshes.forEach((meshe) => {
					if (meshe.name === 'doorInterior_primitive2')
						door.interior = meshe as Mesh
					else if (meshe.name === 'doorInterior_primitive1')
						door.glass = meshe as Mesh
					else if (meshe.name === 'doorInterior_primitive0')
						door.handle = meshe as Mesh
				})

				const doorRotation = new Animation(
					'doorRotation',
					'rotation.y',
					30,
					Animation.ANIMATIONTYPE_FLOAT,
					Animation.ANIMATIONLOOPMODE_CYCLE
				)

				doorRotation.setKeys(keys)

				door.interior?.animations.push(doorRotation)
				door.glass?.animations.push(doorRotation)
				door.handle?.animations.push(doorRotation)

				let open = false
				if (door.interior) {
					door.interior.actionManager = new ActionManager(scene)
					door.interior.actionManager.registerAction(
						new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
							if (open) {
								scene.beginAnimation(door.interior, 40, 0, false)
								scene.beginAnimation(door.glass, 40, 0, false)
								scene.beginAnimation(door.handle, 40, 0, false)
							} else {
								scene.beginAnimation(door.interior, 0, 40, false)
								scene.beginAnimation(door.glass, 0, 40, false)
								scene.beginAnimation(door.handle, 0, 40, false)
							}
							open = !open
						})
					)
				}
			}
		)
	}

	const chairAroundTable = (scene: Scene, config: ChairConfig) => {
		SceneLoader.ImportMesh(
			'',
			MESHES_REPOSITORY,
			'chair.obj',
			scene,
			(meshes) => {
				meshes.forEach((meshe) => {
					meshe.scaling.scaleInPlace(3.6)
					meshe.position = new Vector3(
						(config.tableRayon + DISTANCE_HELPERS) *
							Math.cos(degToRad((360 / config.membersNumber) * config.order)),
						0,
						(config.tableRayon + DISTANCE_HELPERS) *
							Math.sin(degToRad((360 / config.membersNumber) * config.order))
					)
					meshe.rotation = new Vector3(
						0,
						degToRad((-360 / config.membersNumber) * config.order),
						0
					)
					if (meshe.name === 'leather_Cube.002')
						meshe.material = materials.tissue(scene)
					if (meshe.name === 'metal_frame_Plane.001')
						meshe.material = materials.metal(scene)
					/*
				bottom_frame_Cube
				NewUI.vue:174 mesh_mm1
				NewUI.vue:174 leather_Cube.002
				NewUI.vue:174 leggy_Cylinder.013
				NewUI.vue:174 mesh_mm1
				NewUI.vue:174 metal_frame_Plane.001 
				*/

					//meshe.material = woodTexture;
				})
			}
		)
	}

	const character = async (scene: Scene) => {
		const doorPosition = scene.meshes
			.find((mesh) => mesh.name === 'doorInterior_primitive2')
			?.getAbsolutePosition()
		const tablePosition = scene.meshes
			.find((mesh) => mesh.name === 'tableBottom')
			?.getAbsolutePosition()

		const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
			'',
			MESHES_REPOSITORY,
			'avatar-walkinplace.glb'
		)

		const avatar = meshes[1]

		if (tablePosition && doorPosition) {
			meshes.forEach((mesh) => {
				mesh.scaling.scaleInPlace(5.7)
				mesh.rotation.y = degToRad(90)
				mesh.setAbsolutePosition(doorPosition)
				mesh.translate(Axis.X, 5, Space.WORLD)
				mesh.translate(Axis.Z, 1.5, Space.WORLD)
			})

			const frontDoorPos = new Vector3(
				doorPosition.x - 10,
				doorPosition.y,
				doorPosition.z + 1.5
			)
			const distTranslation1 = new Vector3(
				Math.abs(frontDoorPos.x - avatar.getAbsolutePosition().x),
				0,
				Math.abs(frontDoorPos.z - avatar.getAbsolutePosition().z)
			)

			const BehindTablePos = new Vector3(
				tablePosition.x,
				tablePosition.y,
				tablePosition.z + 1.5
			)
			const distTranslation2 = new Vector3(
				Math.abs(BehindTablePos.x - avatar.getAbsolutePosition().x),
				0,
				Math.abs(BehindTablePos.z - avatar.getAbsolutePosition().z)
			)

			characterMovement(
				scene,
				animationGroups[0],
				avatar,
				distTranslation1,
				distTranslation2
			)
		}
	}

	const characterMovement = (
		scene: Scene,
		animation: AnimationGroup,
		avatar: AbstractMesh | Mesh,
		distTranslation1: Vector3,
		distTranslation2: Vector3
	) => {
		console.log('PASSAGE')

		const translation1Keys: Array<{ frame: number; value: Vector3 }> = []
		translation1Keys.push({ frame: 0, value: new Vector3(0, 0, 0) })
		translation1Keys.push({ frame: 40, value: distTranslation1 })

		const rotationKeys: Array<{ frame: number; value: GLfloat }> = []
		rotationKeys.push({ frame: 40, value: degToRad(90) })
		rotationKeys.push({ frame: 60, value: degToRad(45) })

		const translation2Keys: Array<{ frame: number; value: Vector3 }> = []
		translation2Keys.push({ frame: 60, value: distTranslation1 })
		translation2Keys.push({ frame: 100, value: distTranslation2 })

		const characterTranslation = new Animation(
			'walkTranslation',
			'position',
			30,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CYCLE
		)
		characterTranslation.setKeys(translation1Keys)

		const characterRotation = new Animation(
			'walkRotation',
			'rotation.y',
			30,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE
		)
		characterRotation.setKeys(rotationKeys)

		const characterTranslation2 = new Animation(
			'walkTranslation',
			'position',
			30,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CYCLE
		)
		characterTranslation2.setKeys(translation2Keys)

		avatar.animations.push(characterTranslation)
		avatar.animations.push(characterRotation)
		avatar.animations.push(characterTranslation2)

		avatar.actionManager = new ActionManager(scene)
		avatar.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
				// TypeError ??

				try {
					animation.start()
					scene.beginAnimation(avatar, 0, 100, false, undefined, () => {
						console.log('FIN DE TRANSLATION')
						animation.stop()
					})
				} catch (e) {
					// do nothing
				}
			})
		)
	}

	return {
		dummyAvatar,
		dummyAvatarAroundTable,
		mediationRoom,
		chairAroundTable,
		character,
	}
}
