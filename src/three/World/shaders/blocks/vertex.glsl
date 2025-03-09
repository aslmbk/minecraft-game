#define LAMBERT

varying vec3 vViewPosition;

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
    #include <uv_vertex>
    #include <color_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>
    #include <begin_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    vNormal = normalMatrix * normal;
    vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
    vColor = instanceColor;
    
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);

    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
}
