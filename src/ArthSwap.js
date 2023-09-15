import React from 'react';
import { Row, Col, Input, Button, Form } from 'antd';
import { ethers, parseEther, formatEther } from 'ethers';

import './App.css';
import abi from './common/arthswap/abi';

const ROUTER_ADDRESS = '0xA17E7Ba271dC2CC12BA5ECf6D178bF818A6D76EB';
const ARSW_ADDRESS = '0xE17D2c5c7761092f31c9Eca49db426D5f2699BF0'
const WRSTR_ADDRESS = '0x7d5d845Fd0f763cefC24A1cb1675669C3Da62615'

function Swap() {
  const [swapForm] = Form.useForm();
  
  const onSwapClick = async () => {
    console.log('onSwapClick!!!');
    const DEADLINE = '111111111111111111';
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner();
    console.log('signer.address: ', signer.address);

    // const balance = await signer.getBalance();
    // const balance = await provider.getBalance("ethers.eth")
    const balance = await provider.getBalance(signer.address);
    console.log(`signer's balance: `, formatEther(balance));
  
    const contract = new ethers.Contract(ROUTER_ADDRESS, abi, signer);
    const result = await contract.swapExactETHForTokens(
      0,
      [WRSTR_ADDRESS, ARSW_ADDRESS],
      signer.address,
      DEADLINE,
      { value: parseEther('0.1') },
    )

    console.log('Contract address:', ROUTER_ADDRESS);
    console.log('input:', result.data);
    console.log(`signer's balance(BeforeSwap): `, formatEther(balance));
    setTimeout(async () => { 
      const balanceAfterSwap = await provider.getBalance(signer.address);
      console.log(`signer's balance(AfterSwap): `, formatEther(balanceAfterSwap));
    }, 30000);
  }

  const onFinish = (values) => {
    console.log('values: ', values);
  }

  const onValuesChange = () => {}

  let volatilityElement = null;

  return (
    <div className='page-wrapper'>
      <div className="main-container">
        <div className='container page-container'>
          <Row>
            <Col span={12}>
              <div className='price-feed-container'>
                <h1>ArthSwap Price Feed:</h1>
                <div>
                  <table>
                    <thead>
                    <tr className="price-row" style={{ color: '#95098B'}}>
                      <th className="price-col price-first-col">timestamp</th>
                      <th className="price-col">asset</th>
                      <th className="price-col">value</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className='swap-container'>
                <h1>Swap Options</h1>
                <div style={{paddingTop:12, paddingBottom:24}}>
                </div>
                <Form
                  form={swapForm}
                  name="basic"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  autoComplete="off"
                  onValuesChange={onValuesChange}
                  labelAlign="left"
                >
                  <Row>
                    <Col span={24} >
                      <Form.Item label="Stop" >
                        <Row>
                          <Col span={10}>
                          <Form.Item name="price" rules={[{ required: true, message: 'Please input price!' }]} noStyle>
                          <Input />
                        </Form.Item>
                          </Col>
                          <Col span={14}><span style={{paddingLeft:12, lineHeight:'32px'}}></span>{ volatilityElement }</Col>
                        </Row>
                      </Form.Item>
                      <Form.Item label="Amount" >
                        <Row>
                          <Col span={10}>
                          <Form.Item name="mgxAmount" rules={[{ required: true, message: 'Please enter a MGX amount' }]}>
                          <Input />
                          </Form.Item>
                          </Col>
                          <Col span={14}><span style={{paddingLeft:12, lineHeight:'32px'}}></span></Col>
                        </Row>
                      </Form.Item>
                      <Form.Item label="Expected Output:" >
                        <Row>
                          <Col span={16}>
                          </Col>
                        </Row>
                      </Form.Item>
                      
                    </Col>
                  </Row>
                  
                  <div className='important'>
                    <p className="title">Important:</p>
                    <p>Turing will trigger the transaction for inclusion after the price threshold has been met;</p>
                    we cannot guarantee the price received.
                  </div>

                  <div className='d-flex justify-content-center'>
                      <Button className="connect-wallet-button" onClick={onSwapClick}>Swap</Button>
                    </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Swap;
