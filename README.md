# standalone_jdaviz

This repository is an example standalone web embed of [Jdaviz](https://github.com/spacetelescope/jdaviz) using the JS script version of [Voila Embed](https://github.com/mariobuikhuizen/voila-embed).  It is primarily designed to explore CSS conflicts during the embed process.  See https://github.com/spacetelescope/jdaviz/issues/463 for the initial discussion.


## Script-based example

This example is a demo of a Jdaviz web embed for a Vue CDN page,  using the [Voila Embed](https://github.com/mariobuikhuizen/voila-embed) package.
### Example Pages
This repo contains the following example pages
- index_simple.html - a simple embed of Jdaviz in a page predominantly controlled by Vue+Vuetify
- index_jwst.html - an embed of Jdaviz into a page with some extra layout and content for JWST, predominantly controlled by Vue-Vuetify, with some custom css.
- index_zmast.html - an embed of Jdaviz into a page with some extra layout and content for Z.MAST, with a mix of CSS and JS, e.g. Bootstrap, Jquery, Datatables, custom css, etc.

### Run Front-End Server
To set up the front-end, in a terminal window, do the following:

- cd into the `example` subdirectory
- run `npx serve` to spin up a local dev site
- Navigate to `http://localhost:5000` or wherever `npx` locally deployed the front-end.
- The default `index.html` page is equivalent to `index_jwst.html`
- Alternatively navigate to one of the other index files, e.g. `http://localhost:5000/index_simple`

### Run Voila Server
To set up the back-end Voila server, in a new terminal window, do the following:

- Navigate to this top-level directory, i.e. the directory where the `jdaviz_test.ipynb` resides
- install the [Voila Embed](https://github.com/mariobuikhuizen/voila-embed) package
- start the voila server with `voila` to use the configuration in `voila.json`.  Or alternatively run `voila --no-browser --template=embed --enable_nbextensions=True --Voila.tornado_settings="{'allow_origin': 'http://localhost:5000'}" --port=8000`.  This will start Voila running locally on port 8000.
- Reload the front-end web page

## Vue Component Example

This example is a demo of a Jdaviz web embed for a Vue component compiled page,  using the [Voila Embed Vuetify](https://github.com/mariobuikhuizen/voila-embed-vuetify) package.

### Run Front-end Server

The Vue component example is in the `frontend` directory.

- cd into `frontend` subdirectory
- run `yarn serve` to spin up a development server for front-end testing
- or run `yarn build` for production build testing
- In a separate terminal run the Voila Server command below
  
This should start a serve running at `http://localhost:8081`

### Run Voila Server
To set up the back-end Voila server, in a new terminal window, do the following:

- Navigate to this top-level directory, i.e. the directory where the `jdaviz_test.ipynb` resides
- start the voila server with `voila` to use the configuration in `voila.json`.  Or alternatively run `voila --no-browser --template=embed --enable_nbextensions=True --Voila.tornado_settings="{'allow_origin': 'http://localhost:8081', 'allow_credentials':True}" --port=8000`.  This will start Voila running locally on port 8000.
- Reload the front-end web page
