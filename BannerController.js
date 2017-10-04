import Websocket from 'react-websocket';

class BannerController {

  constructor(stationID){
    this.stationID = stationID;
    this.station = stationID === 1 ? 'kotv' : 'kwtv';
    this.bannerFeed = `http://kotv.com/api/getBanners.aspx?station=${this.station}&IsWeb=true`;
    this.cacheDuration = (60 * 1000);
  }

  static hasLocalStorage(){
    let uid = new Date();
      try {
          localStorage.setItem(uid, uid);
          localStorage.removeItem(uid);
          return true;
      } catch (e) {
        return false;
      }
  }

  getCache(callback){
    if(BannerController.hasLocalStorage()){
      let now = (new Date()).getTime();
      let currentdata = localStorage.getItem('banners');
      let current_expire = localStorage.getItem('banners_expire');
      if (!currentdata || current_expire < now){
        this.getData(callback);
      } else {
        return callback(JSON.parse(currentdata));
      }
    } else {
      this.getData(callback);
    }
    return false;
  }

  getData(callback) {
    fetch(this.bannerFeed)
      .then((response) => response.json())
      .then((json) => {
        if(json.length){
          if(BannerController.hasLocalStorage()){
            let cachetime = (new Date()).getTime() + this.cacheDuration;
            localStorage.setItem('banners', JSON.stringify(json));
            localStorage.setItem('banners_expire', cachetime);
          }
          callback(json);
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.log(`Error retrieving Banners: ${error}`);
      });
  }

}

export default BannerController;
