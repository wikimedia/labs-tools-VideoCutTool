import React, { Component } from 'react';
import { Typography, Layout, Upload, InputNumber, Icon, Col, Row } from 'antd';
import "antd/dist/antd.css";
import './App.css';

const { Header, Content, Footer } = Layout;

class App extends Component {
  render() {
    return (
        <Layout className="layout">
          <Header>
            <Typography.Title level={2} style={{ color: 'white' }}> VideoCropTool</Typography.Title>
          </Header>
          <Content style={{ padding: '50px 50px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Upload.Dragger>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
                </Upload.Dragger>
              </Col>
              <Col span={8}>
                <Row gutter={10}>
                  <Col span={6}>
                    <Typography.Text strong style={{paddingRight: '0.2rem'}}>Height</Typography.Text>
                    <InputNumber min={100} max={5000} step={1} />
                  </Col>
                  <Col span={6}>
                    <Typography.Text strong style={{paddingRight: '0.2rem'}}>Width</Typography.Text>
                    <InputNumber min={100} max={5000} step={0.1}/>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
             © 2018 Gopa Vasanth | Github
          </Footer>
        </Layout>
    );
  }
}

export default App;
