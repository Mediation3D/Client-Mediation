import type { Complexity } from './business'
import type { MeshRoomEnum, SkyboxEnum } from './meshes'

export interface MediationConfig {
	scene?: MeshRoomEnum
	skybox?: SkyboxEnum
	useHolistic?: boolean
	holisticComplexity?: Complexity
}
