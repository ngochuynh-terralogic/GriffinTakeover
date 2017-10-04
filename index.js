import React, { Component, PropTypes } from 'react';
import BannerController from 'components/custom/griffin/BannerController';

const jQuery = window['$'];
const stationCall = window.location.hostname.toLowerCase() === 'www.news9.com' ? 'kwtv' : 'kotv';
const stationID = stationCall === 'kwtv' ? 2 : 1;
const categoryID = stationCall === 'kwtv' ? 303483 : 303482;
const stationUrl = stationCall === 'kwtv' ? 'news9' : 'newson6';


class Takeover extends Component {

  constructor(props){
    super(props);
    this.state = {
      title: "",
      image: "",
      link: "",
      stories: [],
      isactive: "",
      banner: null
    }
  }

  componentDidMount(){
    //make ajax call
    //then call buildState()
    //jQuery.ajax({ url:'http://ftpcontent.worldnow.com/kotv/test/wx/takeover.json', dataType:'jsonp', jsonpCallback:'takeover'}).then((data) => { this.buildState(data); });
    fetch(`http://www.${stationUrl}.com/category/${categoryID}/home-page-takeover?clienttype=container.json`)
      .then((response) => response.json())
      .then((responseJson) => { this.buildState(responseJson); })
      .catch((error) => { console.log(`Failed to retrieve Takeover data: ${error}`); });

    let bannerController = new BannerController(stationID);
    bannerController.getCache(this.addBanner);
  }

  addBanner = (data) => {
    if(data.length){
      let tmpBanner;
      for(let i = 0; i < data.length; i += 1){
        let curBanner = data[i];
        let curMask = curBanner['BannerInfoTypeMask'];
        if((curMask & 0x80) > 0){
          tmpBanner = curBanner;
        }
      }
      if(tmpBanner){
        this.setState({
          banner: tmpBanner
        });
      }
    }
  }

  buildState(data){
    if(!jQuery.isEmptyObject(data)){
      window.takeoverdata = data;
      let storiesArr = [];
      data['features'].forEach((item) => {
        if(item.type === 'story'){ storiesArr.push(item); }
      });
      let moreLink = '';
      if(data['abstract'].length && data['abstract'].indexOf('http') > -1){
        moreLink = data['abstract'].replace('<p>', '').replace('</p>', '');
      }
      let img = '';
      let caption = '';
      let isActive = '';
      if(data.hasOwnProperty('abstractimage')){
        img = data['abstractimage']['filename'];
        caption = data['abstractimage']['caption'];
        isActive = 'active';
      }

      this.setState({
        title: caption,
        image: img,
        link: moreLink,
        stories: storiesArr,
        isactive: isActive
      });
    }
  }

  render(){
    let bannerhtml;
    let firstStory;
    let showMore = 'viewmore';
    if(this.state.link !== ''){ showMore = 'viewmore active'; }
    if(this.state.banner){
      bannerhtml =
        <a data-banner-type={this.state.banner['BannerTypeId']}>
          <span>{this.state.banner['Title']}</span>
          <span>: </span>
          <span>{this.state.banner['Description']}</span>
        </a>;
    }
    if(this.state.stories.length){
      firstStory =
        <div>
          <a href={this.state.stories[0].link}>
            <img src={this.state.stories[0].abstractimage.filename} />
            <h3>{this.state.stories[0].headline}</h3>
          </a>
          <p>{this.state.stories[0].abstract}</p>
        </div>;
    }
    return (
      <div id="takeover" className={this.state.isactive}>
        <div className="container">
          <a href={this.state.link}>
            <div className="bggradient"></div>
            <h1 className="mobile">{this.state.title}</h1>
            <img src={this.state.image} />
            <h1 className="desktop">{this.state.title}</h1>
          </a>
          <div className="rightrail">
            <div className="top">
              <div className="bannerbar">
                {bannerhtml}
              </div>
              {firstStory}
            </div>
            <div className="bottom">
              <ul>
                {this.state.stories.map((story, i) => {
                  if(i !== 0){
                    return (
                      <li key={i}>
                        <a href={story.link}>
                          <div className="left">
                            <img src={story.abstractimage.filename} />
                          </div>
                          <div className="right">
                            <h4>{story.headline}</h4>
                          </div>
                        </a>
                      </li>
                    );
                  }
                })}
              </ul>
              <a className={showMore} href="#">
                <span>View More</span>
                <i className="fa fa-angle-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default Takeover;
