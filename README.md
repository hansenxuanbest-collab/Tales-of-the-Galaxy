# Starfall

This folder currently contains the supplied `assets/Starfall_Interceptor.glb`, but is not yet a Unity project. Unity and Unity Hub were not available in the current environment, so Phase 1 could not be compiled or run here.

## Setup

1. Install Unity 2022.3 LTS or newer with Windows Build Support and Universal Render Pipeline.
2. Create/open this folder as a Unity project.
3. Move `assets/Starfall_Interceptor.glb` to `Assets/Art/Ships/Starfall_Interceptor.glb`.
4. Create a scene containing a ship object with `ShipFlightController` and a child camera with `ChaseCamera`.
5. Assign the ship Rigidbody and camera target references in the Inspector.

The scripts in `Assets/Scripts/Phase1` provide the initial flight controller, chase camera, and HUD. They use Unity's legacy input API for compatibility.
