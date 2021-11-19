Vue.component("header-bar", {
    props: ["showJdavizLogo"],
    data() {
        return {
            cssClassName: "",
            vizHref: "",
            filename: 'jw00668-o007_s00582_nirspec_f070lp-g140m_x1d.fits',
            dataUrl: 'mast:JWST/product/jw00668-o007_s00582_nirspec_f070lp-g140m_x1d.fits',
        }
    },
    created() {
        if (this.showJdavizLogo) {
            this.setVizToolLogo();
        }
    },
    methods: {
        // get file name from filename or URI parameter
        getFilename() {
            var filename = Utils.getParam("filename");
            if (filename == null) {
                const uri = Utils.getParam("uri");
                filename = FilenameParser.getFilenameFromUri(uri);
            }
            if (!filename) {
                filename = "not specified";
            }
            return filename.toLowerCase();
        },
        // set class name based on the suffix of the filename. The class name determines the logo that appears (SpecViz, CubeViz, etc).
        setVizToolLogo() {
            // var filename = "";
            // if (this.getFilename() != "") {
            //     filename = this.getFilename();
            // }
            // if (filename == null || filename == "") {
            //     return;
            // }

            filename = this.filename.toLowerCase();
            const suffixLabelMap = [
                { suffix: "c1d.fits", cssClassName: "icon-spec-name", vizHref: "https://jdaviz.readthedocs.io/en/latest/specviz/index.html", helper: "Specviz"},
                { suffix: "x1d.fits", cssClassName: "icon-spec-name", vizHref: "https://jdaviz.readthedocs.io/en/latest/specviz/index.html", helper: "Specviz"},
                { suffix: "x1dints.fits", cssClassName: "icon-spec-name", vizHref: "https://jdaviz.readthedocs.io/en/latest/specviz/index.html", helper: "Specviz"},
                { suffix: "s2d.fits", cssClassName: "icon-spec2-name", vizHref: "https://jdaviz.readthedocs.io/en/latest/mosviz/index.html", helper: "Specviz2d"},
                { suffix: "s3d.fits", cssClassName: "icon-cube-name", vizHref: "https://jdaviz.readthedocs.io/en/latest/cubeviz/index.html", helper: "Cubeviz"},
            ];
            for (var map of suffixLabelMap) {
                if (filename.match(map.suffix)) {
                    this.cssClassName = map.cssClassName;
                    this.vizHref = map.vizHref;
                    this.description = "Documentation for the Jdaviz " + map.helper + " tool";
                    break;
                }
            }
        },
    },
    template: `
        <v-app-bar dense dark color="black" app>

            <v-toolbar-title>
                <a href="/viz/jwst" class="jdaviz-logo">
                    Jdaviz in MAST
                </a>

                <a v-if="showJdavizLogo" :href="vizHref" target="_blank">
                    <span name="viztool" class="header-name-generic" :class="cssClassName"></span>
                </a>
                <tippy v-if="showJdavizLogo" to="viztool"
                    placement="right"
                    boundary="window"
                    arrow>
                    {{ description }}
                </tippy>

            </v-toolbar-title>

            <div class="top-bar-links-container">
                <tippy to="docs"
                    placement="left"
                    boundary="window"
                    arrow>
                    Documentation for the Jdaviz application
                </tippy>
                <tippy to="api"
                    placement="left"
                    boundary="window"
                    arrow>
                    Documentation for programmatic access to JWST data and metadata
                </tippy>

                <span>
                    <a href="https://jdaviz.readthedocs.io/en/latest/" target="_blank" name="docs" class="top-bar-links">Docs</a>
                </span>
                <span class="vertical-line">
                    <a href="/viz/docs/index.html" target="_blank" name="api" class="top-bar-links">API</a>
                </span>
                <span class="vertical-line">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                        <a class="top-bar-links"
                            v-on="on"
                        >
                            Help <svg viewBox="0 0 451.847 451.847" width="12"><path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
                                c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
                                c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z" fill="#fff"/></svg>
                        </a>
                        </template>
                        <v-list class="help-menu">
                            <tippy to="github"
                                placement="left"
                                boundary="window"
                                distance=7
                                arrow>
                                Submit issue on GitHub
                            </tippy>
                            <tippy to="contactus"
                                interactive
                                placement='left'
                                boundary="window"
                                distance=8
                                maxWidth='250px'
                                arrow>
                                Questions or Feedback? Contact us at archive@stsci.edu
                            </tippy>
                            <v-list-item name="github">
                                <v-list-item-title>
                                    <a href="https://github.com/spacetelescope/jdaviz/issues/new/choose" target="_blank">
                                        <span>
                                            <span class="icon-github"></span>
                                            &nbsp;&nbsp;Report an Issue
                                        </span>
                                    </a>
                                </v-list-item-title>
                            </v-list-item>

                            <v-list-item name="contactus">
                            <v-list-item-title>
                                    <a href="mailto:archive@stsci.edu">
                                        <span>
                                        <v-icon dark>mdi-email</v-icon>
                                        &nbsp;Contact Us</span>
                                    </a>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </span>
            </div>
        </v-app-bar>
      `,
});

new Vue({ el: "#top-bar" });
