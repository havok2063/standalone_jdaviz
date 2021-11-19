//- vue v2.6.10
//- follow me https://twitter.com/andrejsharapov

Vue.component("navigation", {
    props: ["item", "uri", "paired"],
    data() {
        return {
            isOpenHelp: false,
            activeHelp: false,
            isOpenOpenDataIn: false,
            activeOpenDataIn: false,
            current: "",
            navList: [
                {
                    name: "Open Data In",
                    children: [
                        {
                            url: this.notebookUrl(),
                            name: "Jupyter",
                            target: "_blank",
                            message: "Download a Jupyter notebook of this data product to display in your local Jdaviz",
                        },
                    ],
                },
            ],
        };
    },
    methods: {
        onclick(item) {
            if (item.name === "Help") {
                this.isOpenHelp = !this.isOpenHelp;
                this.activeHelp = !this.activeHelp;
            }
            if (item.name === "Open Data In") {
                this.isOpenOpenDataIn = !this.isOpenOpenDataIn;
                this.activeOpenDataIn = !this.activeOpenDataIn;
            }
            this.current = item.name;
        },
        getClass(name) {
            var result = [];
            if (name === "Help" && this.current === "Help" && this.isOpenHelp) {
                result.push("isOpen");
            }
            if (name === "Open Data In" && this.current === "Open Data In" && this.isOpenOpenDataIn) {
                result.push("isOpen");
            }
            return result;
        },
        notebookUrl() {
            if (this.paired === undefined) {
                return "/viz/download/notebook?uri=" + this.uri;
            } else {
                return "/viz/download/notebook?uri=" + this.uri + "&paired=" + this.paired;
            }
        },
    },
    template: `
      <ul id="navigation">
          <li v-for="item,index in navList" class="jdaviz-top-nav">
              <hr v-if="index !== 0" role="separator" aria-orientation="vertical" color="white" class="v-divider v-divider--vertical jdaviz-top-nav">
              <template v-if="item.children">
                  <a
                    :href="item.url"
                    @click="onclick(item)"
                    :class="{ activeHelp }">{{ item.name }} <svg viewBox="0 0 451.847 451.847" width="12"><path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
          c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
          c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z" fill="#fff"/></svg></a>
                  <div :class="getClass(item.name)" class="dropdown">
                      <ul>
                          <li
                            v-for="{ url, name, index, target, message } in item.children"
                            :key="index">
                              <a :name="name" :href="url" :target="target">{{ name }}
                              <tippy to="Jupyter" interactiveBorder="0" placement="right" boundary="window" arrow>
                                {{ message }}
                              </tippy>
                          </li>
                      </ul>
                  </div>
                  
                  </template>
              <template v-else>
                  <a @click="onclick(item)"
                    :href="item.url"
                    >{{ item.name }}</a>
                </template>
            </li>
      </ul>
      `,
});

new Vue({ el: "#navbar-open-data-in" });
