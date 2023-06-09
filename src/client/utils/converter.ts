import { Vector3 } from '@babylonjs/core'
import type { Coordinate } from '@/client/types/business'

export function degToRad(deg: number): number {
	return deg * (Math.PI / 180)
}

export function coordinateToVector3(coord: Coordinate): Vector3 {
	return new Vector3(coord.x, coord.y, coord.z)
}
