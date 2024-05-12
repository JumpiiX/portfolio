#define TOTO
#define MATCAP
#define USE_MATCAP

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float uRevealProgress;

varying vec3 vWorldPosition;

#include ../partials/easeSin.glsl


void main() {

    #include <uv_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

        vNormal = normalize( transformedNormal );

    #endif

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>

    vec4 worldNormal = modelMatrix * vec4(normal, 1.0);

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);

    float distanceToCenter = length(worldPosition);
    float zAmplitude = 3.2;
    float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
    revealProgress = 1.0 - clamp(revealProgress, - 0.1, 1.0);
    revealProgress = pow(revealProgress, 2.0);
    if(uRevealProgress > 0.9)
    {
        revealProgress = 0.0;
    }
    worldPosition.z -= revealProgress * zAmplitude;

    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;



    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <fog_vertex>

    vViewPosition = - mvPosition.xyz;

}
