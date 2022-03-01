<template>
    <div>
        <jupyter-widget-embed
                voila-url="http://localhost:8000"
                notebook="jdaviz_test.ipynb"
                mount-id="jdaviz"
                :request-options=requestOptions
        ></jupyter-widget-embed>
        <jupyter-widget-embed
                voila-url="http://localhost:8000"
                notebook="jdaviz_test.ipynb"
                mount-id="out"
                :request-options=requestOptions
        ></jupyter-widget-embed>
    </div>
</template>
<script>
    import { requestWidget, JupyterWidgetEmbed } from 'voila-embed-vuetify';
    export default {
        name: "Jdaviz",
        components: {
            JupyterWidgetEmbed
        },
        data() {
            return {
                dataUrl: 'mast:JWST/product/jw00668-o007_s00582_nirspec_f070lp-g140m_x1d.fits',
                requestOptions: {"credentials": 'include'},
            }
        },
        created() {
            /* Get the widgets models. These are backbone.js models, see
             * https://backbonejs.org/#Model for more information */
            requestWidget({
                voilaUrl: 'http://localhost:8000',
                notebook: "jdaviz_test.ipynb",
                mountId: "jdaviz",
            }).then((sevent) => {
                sevent.send({
                    event: "load",
                    data: {
                        uri: this.dataUrl,
                        paired_uri: null,
                        host: window.location.hostname,
                        local: true,
                        obs_params: null,
                    },
                });
            });
        }
    }
</script>
<style scoped>
</style>