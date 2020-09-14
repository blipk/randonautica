import Vue from 'nativescript-vue';
import App from './components/App.vue';
import Dialog from './components/Dialog.vue';

import VueDevtools from 'nativescript-vue-devtools';
//if(TNS_ENV !== 'production') Vue.use(VueDevtools);
//Vue.config.silent = (TNS_ENV === 'production');

import { PDFView } from 'nativescript-pdf-view';
Vue.registerElement('PDFView', () => PDFView);
Vue.registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

/*
import {TNSFontIcon, fonticon} from 'nativescript-fonticon';
TNSFontIcon.debug = true;
TNSFontIcon.paths = {
  'icon': './assets/IcoMoon-Free.css'
};
TNSFontIcon.loadCss();
Vue.filter('fonticon', fonticon);
*/

const router = { 
  pgHome: App, 
  pgDialog: Dialog, 
}
Vue.prototype.$router = router;
Vue.prototype.$routeToPage = function(TemplateName, Options){
  let options = Options || {
      clearHistory: false, 
      backstackVisible: true, 
      transition: { 
          name: "slide",
          duration: 380,
          curve: "easeIn"
      },
      transitioniOS: {},
      transitionAndroid: {},
      //props: Properties,
      //frame: Frame
  }
  this.$navigateTo(this.$router[TemplateName], options);
};
Vue.prototype.$routeToModal = function(TemplateName, Options){
  let options = Options || {
      transition: {},
      transitioniOS: {},
      transitionAndroid: {},
      //fullscreen: true,
      //props: Properties,
      //frame: Frame
  }
  this.$showModal(this.$router[TemplateName], options)
  .then(data => console.log(data));
};

const myApp = new Vue({
  render: h => h('frame', [h(App)])
}).$start();
