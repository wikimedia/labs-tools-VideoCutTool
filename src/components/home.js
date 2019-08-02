import React, { Component } from 'react';

import { Menu, Input, Progress, Divider, Typography, Layout, Icon, Col, Radio, Form, Row, Button, Checkbox } from 'antd';
import { Player } from 'video-react';
import { FormGroup } from 'reactstrap';
import Popup from "reactjs-popup";
import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

import '../App.css';
import "antd/dist/antd.css";
import "../../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';
import Draggable from 'react-draggable';

const { Header, Content, Footer } = Layout;

class home extends Component {

  constructor(props) {
    super(props);

    this.onChange= this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.updatePlayerInfo = this.updatePlayerInfo.bind(this);
    this.onChangeCrop = this.onChangeCrop.bind(this);
    this.displayCrop = this.displayCrop.bind(this);
    this.displayTrim = this.displayTrim.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
    this.displayRotate = this.displayRotate.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.videoName = this.videoName.bind(this);
    this.rotatingDone = this.rotatingDone.bind(this);
    this.state = { open: false };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.beforeOnTapCrop = this.beforeOnTapCrop.bind(this);
    this.AfterOnTapCrop = this.AfterOnTapCrop.bind(this);

    this.state = {
      deltaPosition: {
              x: 0,
              y: 0,
      },
      inputVideoUrl: '',
      trims: [{from: '', to: ''}],
      out_width: '',
      out_height: '',
      x_value: '',
      y_value: '',
      display: false,
      displayCrop: false,
      displayTrim: false,
      displayRotate: false,
      displayPlayer:false,
      disableAudio: false,
      progressTrack: 0,
      videoName: '',
      displayVideoName: false,
      rotate: false,
      toggle: false,
      user: null,
      beforeOnTapCrop: true,
      AfterOnTapCrop: false,
      upload: false
    }
  }

  onLogin() {
    PopupTools.popup('/video-cut-tool/auth/mediawiki/callback', 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
      if (!err) {
        console.log(' login response ', err, data);
        this.setState({user: data.user})
        NotificationManager.success('Awesome! You can now upload files to VideoWiki directly from your computer.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        if (this.props.onAuth) {
          this.props.onAuth()
        }
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.playerSource !== prevState.playerSource) {
      this.refs.player.load();
    }
  }

  handleValueChange(e) {
    var value = e.target.value;
    this.setState({
      [e.target.id]: value
    });
  }

  rotatingDone() {
    this.setState(function(state) {
      return {
        toggle: !state.toggle,
        rotate: false
      };
    });
  }

  openModal() {
    this.setState({ open: true });
  }
  closeModal() {
    this.setState({ open: false });
  }

  eventLogger = (e: MouseEvent, data: Object) => {
    console.log('Event: ', e);
    console.log('Data: ', data);
  };

  updatePlayerInfo() {
    this.setState({
      playerSource: this.state.inputVideoUrl,
      display: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false
    })
  }

  videoName() {
    this.setState({
      videoName: this.state.videoName
    })
  }

  displayCrop() {
    this.setState({
      displayCrop: true,
      displayTrim: false,
      displayRotate: false,
      displayPlayer: false
    })
  }

  beforeOnTapCrop(){
    this.setState({
      beforeOnTapCrop: true
    })
  }

  AfterOnTapCrop(){
    this.setState({
      beforeOnTapCrop: false,
      AfterOnTapCrop: true
    })
  }

  displayTrim() {
    this.setState({
      displayTrim: true,
      displayCrop: false,
      displayRotate: false
    })
  }

  displayRotate(){
    this.setState({
      displayRotate: true,
      displayCrop: false,
      displayTrim: false,
      displayPlayer: false
    })
  }

  disableAudio() {
    this.setState({
      disableAudio: true
    })
  }

  displayVideoName(){
    this.setState({
      displayVideoName: true,
    })
  }

  onChangeCrop(e){
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onChangeRadioButton = e => {
    this.setState({
      value: e.target.value,
    });
  };

  add = () => {
    let trims = this.state.trims;
    trims.push({"from":'',"to":''});
    this.setState({
      trims: trims
    });
  };

  onChange = (e) => {
    let trims = this.state.trims;
    const id = e.target.id;
    const index = id.match(/\d+/g).map(Number)[0];

    if( id.includes("from") ) {
      trims[index].from = e.target.value;
    }
    else if ( id.includes("to") ) {
      trims[index].to = e.target.value;
    }
    this.setState({
      trims: trims
    })
  };

  loginRequest(e){

  };

  getInitialState() {
  return {
    activeDrags: 0,
    deltaPosition: {
      x: 0, y: 0
    },
    controlledPosition: {
      x: -400, y: 200
    }
  };
}

  handleDrag(e, ui) {
      const {x, y} = this.state.deltaPosition;
      this.setState({
        deltaPosition: {
          x: x + ui.deltaX,
          y: y + ui.deltaY,
        }
      });
  };

  onSubmit(e) {
    e.preventDefault();
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.state.trims,
      out_width: this.state.out_width,
      out_height: this.state.out_height,
      x_value: this.state.x_value,
      y_value: this.state.y_value,
      trimMode: e.target.name,
      disableAudio: this.state.disableAudio,
      value: this.state.value,
      user: this.state.user,
      upload: this.state.upload
    };

    axios.post('http://localhost:4000/video-cut-tool-back-end/send', obj)
        // .then(res => console.log(res.data.message))
        .then( (res) =>{
          // res.data.message === "Rotating success" ? null : this.setState({ progressTrack: 50 })
          console.log(res);
          if (res.data.message === "Rotating Sucess" || res.data.message === "Cropping Sucess"  ) {
            this.setState({ progressTrack: 100 });
            this.setState({ displayVideoName: true})
            this.setState({ videoName: res.data.videoName });
            console.log(res.data.message);
            console.log("VideoName: " + res.data.videoName)
          }
        } );
          console.log("Progress Track: " + this.state.progressTrack)

    this.setState({
      from_location: '',
      inputVideoUrl: '',
      trims: [{from: '', to: ''}],
      out_width: '',
      out_height: '',
      x_value: '',
      y_value: '',
      trimMode: '',
      disableAudio: '',
      value: ''
    })
  }

  render() {
    const { deltaPosition } = this.state;
    const dragHandlers = {onStart: this.onStart, onStop: this.onStop};
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    
     const trims = this.state.trims.map((trim, i) =>
        (
            <Row gutter={10} key={i}>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>From</Typography.Text>
                <div className="form-group">
                  <Input placeholder="hh:mm:ss"
                         id={`trim-${i}-from`}
                         value={trim.from}
                         onChange={this.onChange}/>
                </div>
              </Col>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>To</Typography.Text>
                <div className="form-group">
                  <Input placeholder="hh:mm:ss"
                         id={`trim-${i}-to`}
                         value={trim.to}
                         onChange={this.onChange}/>
                </div>
              </Col>
            </Row>
        )
    );

    return (
        <Layout className="layout">
          <Header>
            <div className="logo" />
            <Menu
                theme="dark"
                mode="horizontal"
                style={{ lineHeight: '64px' }}
            >
              {/* <a href="http://localhost:4000/video-cut-tool-back-end/login" style={{float: 'right'}} ><span> Login </span></a> */}
                <Button
                  primary
                  className="c-auth-buttons__signup"
                  style={{float: 'right'}}
                  onClick={this.onLogin.bind(this)}
                >
                  Register / Login with Wikipedia
                </Button>
              <Typography.Title level={4} style={{ color: 'White', float: 'left' }}> VideoCutTool</Typography.Title>
            </Menu>
          </Header>
          <form onSubmit={this.onSubmit}>
            <Content className='Content' style={{ padding: '50px 50px' }}>
              <Row gutter={16}>
                <Col span={16}>
                  <div style={{padding: '1rem'}}>
                    <div className="docs-example" style ={{ height: '100%' }}>
                      <Form>
                        <FormGroup>
                            <Typography.Title level={4} style={{ color: 'Black' }}> Video URL <Button href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool" style={{float: 'right'}}><Icon type="question-circle"  /></Button></Typography.Title>
                            <Input
                                placeholder="https://upload.wikimedia.org/wikipedia/commons/video.webm"
                                ref="inputVideoUrl"
                                name="inputVideoUrl"
                                id="inputVideoUrl"
                                value={this.state.inputVideoUrl}
                                onChange={this.handleValueChange}
                            />
                        </FormGroup>
                        <div>
                          <FormGroup>
                            <Button type="primary"  onClick={this.updatePlayerInfo} style={{marginTop: '12px'}}>
                              Play Video
                            </Button>
                            <br />
                            {
                              this.state.displayVideoName ?
                                <a href={`/../../../VideoCutTool-Back-End/routes/${this.state.videoName}`} download={`${this.state.videoName}`}>Download Your Video Here</a>
                                // <a href= {`http://localhost:4000/routes/${this.state.videoName}`} download="{this.state.videoName}">Click here to download your video {this.state.videoName} </a>
                                // <a href='/somefile.txt' download>Click to download</a>
                              : null
                            }
                          </FormGroup>
                        </div>
                      </Form>
                      <br />
                      { this.state.displayPlayer ?
                        <div className="player">
                            <Player ref="player" videoId="video-1">
                                <source src={this.state.playerSource}/>
                            </Player> 
                          </div> : null
                      }

                        {/* Crop Video */}
                          { this.state.displayCrop ?
                            <div>
                                <div className="box" style={{height: '100%', width: '100%', position: 'relative', overflow: 'auto', padding: '0'}}>
                                    <div style={{height: '100%', width: '100%', padding: '1px'}}>
                                        <Draggable bounds="parent"  {...dragHandlers}
                                            axis="both"
                                            onDrag={
                                                (e, ui)=>{
                                                  this.handleDrag(e, ui);
                                                  this.setState({
                                                    x_value: e.x,
                                                    y_value: e.y,
                                                    out_height: e.explicitOriginalTarget.scrollHeight,
                                                    out_width: e.explicitOriginalTarget.scrollWidth
                                                  })
                                                  console.log("X value: " + e.x + "  Y value: " + e.y);
                                                  // console.log( "Height : " + e.explicitOriginalTarget.scrollHeight + " Width : " +   e.explicitOriginalTarget.scrollWidth);
                                                  console.log("Height: " + this.state.out_height + " Width: " + this.state.out_width);
                                                }                                             
                                            }
                                        >
                                            <div className="box" id="mydiv" onHeightReady={height => console.log("Height: " +  height)}>
                                              <div id="mydivheader"></div>
                                            </div>
                                        </Draggable>
                                        { this.state.beforeOnTapCrop ?
                                            <div>
                                              <Player ref="player" height='300' width='300' videoId="video-1">
                                                      <source src={this.state.playerSource}/>
                                              </Player>
                                            </div> : null
                                        }
                                    </div>
                                </div>

                                <div>
                                  <div className="box" style={{height: this.state.out_height, width: this.state.out_width, position: 'fixed', overflow: 'auto', padding: '0'}}>
                                      { this.state.AfterOnTapCrop ?
                                          <div>
                                            <Player ref="player" videoId="video-1">
                                                    <source src={this.state.playerSource}/>
                                            </Player>
                                          </div> : null
                                      }                             
                                </div>

                              </div> 
                            </div>: null
                          }

                        {/* Rotate Video */}
                          { this.state.displayRotate ?
                            <div>
                              <div id="RotatePlayer">
                                <Player ref="player" videoId="video-1">
                                    <source src={this.state.playerSource}/>
                                </Player>
                                {/* <Popup
                                          open={this.state.open}
                                          closeOnDocumentClick
                                          onClose={this.closeModal}
                                        >
                                            <a className="close" onClick={this.closeModal}>
                                              &times;
                                            </a>
                                            <img
                                                src={ this.state.toggle ? "https://upload.wikimedia.org/wikipedia/commons/c/c7/Commons-logo-square.png"
                                                    : "https://upload.wikimedia.org/wikipedia/commons/c/c7/Commons-logo-square.png"
                                                } style={{align: "middle"}}
                                                ref={elm => {
                                                  this.image = elm;
                                                }}
                                                className={this.state.rotate ? "rotate" : ""}
                                              />

                                        </Popup>                                 */}
                              </div>
                              {/* <Progress percent={this.state.progressTrack} status="active" />  */}
                            </div>: null     
                          }
                    </div>
                  </div>
                </Col>
                    <Col span={8}>
                    <h2 style={{ textAlign: 'center' }}>Video Settings </h2>
                    <div className="disableAudio" style={{ pos: '10px' }}>
                      <Checkbox onClick={this.disableAudio}> Remove Audio</Checkbox>
                    </div>
                    <br />
                    <Button type="primary"
                            onClick={this.displayTrim}
                            style={{margin: "1rem", marginLeft: "2.25rem"}}
                    >
                            <Icon type="scissor" /> Trimming
                    </Button>
                      <Button type="primary"
                            onClick={this.displayCrop}
                            style={{margin: "1rem", marginLeft: "2.25rem"}}
                        >
                              <Icon type="radius-upright" /> Cropping
                      </Button>
                    <Button type="primary"
                          onClick={this.displayRotate}
                          style={{margin: "1rem", marginLeft: "2.25rem"}}
                      >
                            <Icon type="reload"/> Rotate Video
                    </Button>

                            { this.state.displayTrim ?
                                  <div className="trim-settings">
                                    <h2>Video Trim Settings </h2>
                                    {trims}
                                     <Button type="primary"
                                            onClick={this.add}
                                            style={{margin: "1rem", marginLeft: "2.25rem"}}
                                    >
                                      <Icon type="plus"/> Add More
                                    </Button>
                                    <br/>
                                    <div className="form-group">
                                        <div>
                                          <Col span={12}>
                                            <Button type="primary"
                                                    onClick={this.onSubmit}
                                                    name="single"
                                                    color="primary"
                                                    value="Submitted">
                                              <Icon type="radius-setting"/> As Single Video
                                            </Button>
                                          </Col>
                                          <Col Span={12}>
                                            <Button type="primary"
                                                    onClick={this.onSubmit}
                                                    color="primary"
                                                    name="multiple"
                                                    value="Submitted">
                                              <Icon type="radius-setting"/> As Multiple Videos
                                            </Button>
                                          </Col>
                                          <Button
                                              color="primary"
                                              style={{marginLeft: '10px', marginTop: '10px'}}
                                              value="Submitted"
                                              upload="true"
                                          >
                                            <Icon type="upload"/>Upload to Commons
                                          </Button>
                                        </div>
                                  </div>
                                </div> : null
                            }
                            { this.state.displayCrop ?
                            <div className="crop-settings">
                              <h2>Video Crop Settings </h2>
                                <br/>
                                  <div className="form-group">
                                    <Button type="primary"
                                            onClick={(e) => {
                                              this.setState({
                                                //progressbar rotate
                                                rotate: true,
                                                beforeOnTapCrop: false,
                                                AfterOnTapCrop: true,
                                              });
                                              this.openModal(e);
                                              // this.onSubmit(e);
                                            }}
                                            color="primary"
                                            name="crop"
                                            value="Submitted">
                                      <Icon type="radius-setting"/> Crop
                                    </Button>
                                    <Button
                                        color="primary"
                                        style={{marginLeft: '10px'}}
                                        value="Submitted"
                                    >
                                      <Icon type="upload"/>Upload to Commons
                                    </Button>
                                  </div>
                          </div> : null
                         }
                               <Divider>Your new video</Divider>
                              {/* <h2 style={{ textAlign: 'center' }}>Your New Video </h2> */}
                              <Col span={10}>
                                  <Button type="primary"
                                      onClick={this.onSubmit}
                                      name="rotate"
                                      style={{margin: "1rem", marginLeft: "2.25rem"}}
                                  >
                                        <Icon type="download" /> Download
                                </Button>
                              </Col>
                              <Col span={12}>
                                <Button type="primary"
                                      onClick={this.onSubmit}
                                      name="rotate"
                                      style={{margin: "1rem", marginLeft: "2.25rem"}}
                                  >
                                        <Icon type="upload" /> Upload to Commons
                                </Button>
                              </Col>
                    </Col>
              </Row>
              <br />
            </Content>
          </form>
          <Footer style={{ textAlign: 'center' }}>
            © 2019 <a href="https://www.mediawiki.org/wiki/User:Gopavasanth"><span> Gopa Vasanth </span></a> |
            <a href="https://github.com/gopavasanth/VideoCutTool"><span> Github </span></a> |
            <a href="https://www.gnu.org/licenses/gpl-3.0.txt"><span> GNU Licence </span></a>
          </Footer>
        </Layout>
    );
  }
}

export default home;