#define LAMBERT

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <logdepthbuf_pars_fragment>

void main() {
    vec3 normal = normalize(vNormal);
    vec4 diffuseColor = vec4(vColor, 1.0);
    vec3 outgoingLight = vec3(0.0);
    
    // Добавляем ambient освещение
    outgoingLight += ambientLightColor * diffuseColor.rgb;
    
    // Добавляем directional освещение
    #if NUM_DIR_LIGHTS > 0
    for(int i = 0; i < NUM_DIR_LIGHTS; i++) {
        vec3 dirVector = directionalLights[i].direction;
        float dotNL = max(dot(normal, dirVector), 0.0);
        outgoingLight += directionalLights[i].color * diffuseColor.rgb * dotNL;
    }
    #endif
    
    gl_FragColor = vec4(outgoingLight, diffuseColor.a);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
    #include <fog_fragment>
}
