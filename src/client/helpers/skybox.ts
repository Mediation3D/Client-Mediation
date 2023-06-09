import { Color3, HemisphericLight, PhotoDome, Vector3 } from '@babylonjs/core'
import type { Scene } from '@/client/types/business'
import { SkyboxEnum, type SkyboxList } from '@/client/types/meshes'

const skybox: SkyboxList = {
	CLEAR_SKY: {
		onCreate: (scene: Scene) => {
			// Skybox
			const _dome = new PhotoDome(
				'skybox',
				'assets/skyboxes/clear_sky.png',
				{
					resolution: 32,
					size: 1000,
				},
				scene
			)
			_dome.rotation.y = 0

			// Light
			const light = new HemisphericLight(
				'light_skybox',
				new Vector3(-30, 15, 40),
				scene
			)
			light.intensity = 1
		},
	},
	CLEAR_SKY_GROUND: {
		onCreate: (scene: Scene) => {
			// Skybox
			const _dome = new PhotoDome(
				'skybox',
				'assets/skyboxes/clear_sky_ground.png',
				{
					resolution: 32,
					size: 1000,
				},
				scene
			)
			_dome.rotation.y = 0

			// Light
			const light = new HemisphericLight(
				'light_skybox',
				new Vector3(-30, 15, 40),
				scene
			)
			light.intensity = 1
		},
	},
	MOUNTAIN: {
		onCreate: (scene: Scene) => {
			// Skybox
			const _dome = new PhotoDome(
				'skybox',
				'assets/skyboxes/mountain.png',
				{
					resolution: 32,
					size: 1000,
				},
				scene
			)
			_dome.rotation.y = 0

			// Light
			const light = new HemisphericLight(
				'light_skybox',
				new Vector3(-55, 12, 40),
				scene
			)
			light.intensity = 0.3
			light.specular = new Color3(150, 100, 25)
		},
	},
}

export function loadSkybox(
	scene: Scene,
	skyboxEnum: SkyboxEnum = SkyboxEnum.CLEAR_SKY
) {
	skybox[skyboxEnum].onCreate(scene)
}
