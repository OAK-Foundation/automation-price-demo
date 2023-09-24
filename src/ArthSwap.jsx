import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import BN from 'bn.js';
import {
  Row, Col, Input, Button, Form, Modal, Radio, Space, message, Layout, Table,
} from 'antd';

import './App.css';
// import { chains } from '@oak-network/config';
// import { AstarAdapter } from '@oak-network/adapter';
import moment from 'moment';
import { WalletEthereumContextProvider, useWalletEthereum } from './context/WalletEthereum';
import { WalletPolkadotContextProvider, useWalletPolkadot } from './context/WalletPolkadot';
import PageContainer from './components/PageContainer';
import Container from './components/Container';
import Swap from './components/Swap';
import AutomationTime from './components/AutomationTime';
import AutomationPrice from './components/AutomationPrice';
import polkadotHelper from './common/polkadotHelper';
import { network, priceColumns, MOMENT_FORMAT } from './config';
import WalletConnectMetamask from './components/WalletConnectMetamask';
import WalletConnectPolkadotjs from './components/WalletConnectPolkadotjs';
import { sendExtrinsic } from './common/utils';

const {
  Header, Footer, Sider, Content,
} = Layout;
// import polkadotHelper from './common/polkadotHelper';


/**
 * Wait for all promises to succeed, otherwise throw an exception.
 * @param {*} promises
 * @returns promise
 */
export const waitPromises = (promises) => new Promise((resolve, reject) => {
  Promise.all(promises).then(resolve).catch(reject);
});

function ArthSwapApp() {
  const [swapForm] = Form.useForm();

  const {
    wallet, setWallet, provider, setProvider,
  } = useWalletEthereum();

  // App states
  const [apis, setApis] = useState([]); // Turing will always be index 0, and the other parachain is index 1
  const [priceArray, setPriceArray] = useState([]);

  // const [polkadotWallet, setPolkadotWallet] = useState(null);

  useEffect(() => {
    async function asyncInit() {
      try {
        // const chainId = await providerOnLoad.send('eth_chainId', []);
        // const chainIdDecimal = parseInt(chainId, 16);
        // console.log(`network chainId: ${chainIdDecimal} (${chainIdDecimal === network.chainId ? 'Rocstar' : 'Unknown'})`);

        // // Initialize and set up Turing and parachain APIs
        // const wsProvider = new WsProvider(network.endpoint);
        // const parachainApi = await ApiPromise.create({ provider: wsProvider });

        // const turingApi = await polkadotHelper.getPolkadotApi();
        // setApis([turingApi, parachainApi]);

        // const result = await turingApi.query.automationPrice.priceRegistry.entries('shibuya', 'arthswap');
        // console.log('price: ', result[0][1].unwrap().amount.toString());

        // Subscribe to chain storage of Turing for price monitoring
        //   const unsubscribe = await turingApi.rpc.chain.subscr((header) => {
        //     console.log(`Chain is at block: #${header.number}`);

        //     if (++count === 256) {
        //       unsubscribe();
        //       process.exit(0);
        //     }
        //   });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    asyncInit(); // Call the async function inside useEffect

    // You can perform any cleanup or additional actions here if needed
    // For example, removing event listeners or making API requests
    // Be sure to return a cleanup function if necessary
    return () => {
      // Cleanup code here (if needed)
    };
  }, []); // The empty dependency array [] ensures that this effect runs only once, similar to componentDidMount

  const onFinish = (values) => {
    console.log('values: ', values);
  };

  const onValuesChange = () => {};

  const volatilityElement = null;

  /**
   * Use MetaMask to schedule a Swap transaction via XCM
   */
  const onClickScheduleByPrice = useCallback(async () => {
    // if (_.isNull(wallet)) {
    //   message.error('Wallet needs to be connected first.');
    // }
    const turingApi = await polkadotHelper.getPolkadotApi();
    const result = await turingApi.query.automationPrice.priceRegistry.entries('shibuya', 'arthswap');
    console.log('price: ', result[0][1].unwrap().amount.toString());
  }, [wallet, provider]);

  const onClickInitAsset = useCallback(async () => {
    console.log('onClickInitAsset is called');

    if (_.isNull(wallet)) {
      message.error('Wallet needs to be connected first.');
    }

    const api = apis[0];
    const extrinsic = api.tx.automationPrice.initializeAsset('shibuya', 'arthswap', 'WRSTR', 'USDT', '18', [wallet?.address]);

    console.log('wallet?.signer', wallet?.signer);
    console.log('extrinsic.method.toHex()', extrinsic.method.toHex());
    await sendExtrinsic(api, extrinsic, wallet?.address, wallet?.signer);
  }, [apis, wallet]);

  const onClickUpdatePrice = useCallback(async () => {
    console.log('onClickUpdatePrice is called');
    const api = apis[0];
    const price = 80;
    const submittedAt = moment().unix();

    const extrinsic = api.tx.automationPrice.updateAssetPrices(['shibuya'], ['arthswap'], ['WRSTR'], ['USDT'], [price], [submittedAt], [0]);

    console.log('extrinsic', extrinsic.toHuman());

    await sendExtrinsic(api, extrinsic, wallet?.address, wallet?.signer);
  }, [apis, wallet]);

  const onClickFetchPrice = useCallback(async () => {
    console.log('onClickFetchPrice is called');

    const results = await apis[0].query.automationPrice.priceRegistry.entries('shibuya', 'arthswap');
    console.log('results: ', results);

    console.log('results[0][0].toHuman()', results[0][0].toHuman());

    if (_.isEmpty(results)) {
      message.error('PriceRegistry is empty; Please initialize the asset first.');
    }

    console.log('results[0][0].toHuman()', results[0][0].toHuman());
    console.log('results[0][1].toHuman()', results[0][1].toHuman());

    const symbols = results[0][0].toHuman()[2];
    const data = results[0][1].toHuman();
    const retrievedTimestamp = moment();
    const { amount } = data;

    const priceItem = {
      timestamp: retrievedTimestamp,
      symbols,
      price: amount,
    };
    console.log('timestamp', retrievedTimestamp.format(MOMENT_FORMAT), 'symbols', symbols, 'amount', amount);

    const newPriceArray = _.cloneDeep(priceArray);

    newPriceArray.push(priceItem);
    console.log(newPriceArray);
    setPriceArray(newPriceArray);
  }, [apis, priceArray]);

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    width: '100%',
    backgroundColor: '#fff',
    lineHeight: '2rem',
    minHeight: '6rem',
  };

  const contentStyle = {
    minHeight: 120,
    lineHeight: '2rem',
  };

  const formattedPriceArray = _.map(priceArray, (item, index) => {
    const formattedTimestamp = item.timestamp.format(MOMENT_FORMAT);
    return {
      key: `${index}-${formattedTimestamp}`,
      timestamp: formattedTimestamp,
      symbols: _.join(item.symbols, '-'),
      price: item.price,
    };
  });

  /**
   * Main functions
   */
  return (
    <Space direction="vertical" style={{ width: '100%', paddingTop: '1rem', paddingBottom: '1rem' }} size={[0, 48]}>
      <Layout>
        <Header style={headerStyle}>
          <PageContainer style={{ height: '100%' }}>
            <Row>
              <Col span={12}>
                <WalletPolkadotContextProvider>
                  <WalletConnectPolkadotjs />
                </WalletPolkadotContextProvider>
              </Col>
              <Col span={12}>
                <WalletEthereumContextProvider>
                  <WalletConnectMetamask />
                </WalletEthereumContextProvider>
              </Col>
            </Row>
          </PageContainer>
        </Header>
        <Content style={contentStyle}>
          <PageContainer style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <Row justify="start" gutter={32}>
              <Col span={12}>
                <Container>
                  <Space direction="vertical">
                    <h2>Swap Options</h2>
                    <WalletEthereumContextProvider>
                      <Swap />
                    </WalletEthereumContextProvider>
                    <WalletPolkadotContextProvider>
                      <AutomationTime />
                      <AutomationPrice />
                    </WalletPolkadotContextProvider>
                    {/* <Form
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
                        <Col span={24}>
                          <Form.Item label="Stop">
                            <Row>
                              <Col span={10}>
                                <Form.Item name="price" rules={[{ required: true, message: 'Please input price!' }]} noStyle>
                                  <Input />
                                </Form.Item>
                              </Col>
                              <Col span={14}>
                                <span style={{ paddingLeft: 12, lineHeight: '32px' }} />
                                { volatilityElement }
                              </Col>
                            </Row>
                          </Form.Item>
                          <Form.Item label="Amount">
                            <Row>
                              <Col span={10}>
                                <Form.Item name="mgxAmount" rules={[{ required: true, message: 'Please enter a MGX amount' }]}>
                                  <Input />
                                </Form.Item>
                              </Col>
                              <Col span={14}><span style={{ paddingLeft: 12, lineHeight: '32px' }} /></Col>
                            </Row>
                          </Form.Item>
                          <Form.Item label="Expected Output:">
                            <Row>
                              <Col span={16} />
                            </Row>
                          </Form.Item>

                        </Col>
                      </Row>

                      <div className="important">
                        <p className="title">Important:</p>
                        <p>Turing will trigger the transaction for inclusion after the price threshold has been met;</p>
                        we cannot guarantee the price received.
                      </div>

                      <div className="d-flex justify-content-center">
                          <dl>
                            <div>
                              <dt>Wallet</dt>
                              <dd>{wallet?.address}</dd>
                            </div>
                            <div>
                              <dt>Balance</dt>
                              <dd>{wallet?.balance} {network.symbol}</dd>
                            </div>
                            <div>
                              <dt>Smart Contract</dt>
                              <dd>{ROUTER_ADDRESS} (ArthSwap Router)</dd>
                            </div>
                            <div>
                              <dt>Method</dt>
                              <dd>swapExactETHForTokens (Market Buy)</dd>
                            </div>
                            <div>
                              <dt>Amount</dt>
                              <dd>0.01 ${network.symbol}</dd>
                            </div>
                            <div>
                              <dt>Estimated Amount</dt>
                              <dd>100 ARTH</dd>
                            </div>
                            <br />
                            <div>
                              <dt>Status</dt>
                              <dd>{swapStatus}</dd>
                            </div>
                            {receiptSwap?.blockNumber && (
                            <div>
                              <dt>Mined Block Height</dt>
                              <dd>{receiptSwap?.blockNumber}</dd>
                            </div>
                            )}
                            {receiptSwap?.hash && (
                            <div>
                              <dt>Transaction Hash</dt>
                              <dd>{receiptSwap?.hash}</dd>
                            </div>
                            )}
                          </dl>
                        </Modal>
                        <Button onClick={onClickScheduleByPrice}>Schedule by Price</Button>
                      </div>
                    </Form> */}
                  </Space>
                </Container>
              </Col>
              <Col span={12}>
                <Container>
                  <h2>ArthSwap Price Feed:</h2>
                  <div>
                    <Table columns={priceColumns} dataSource={formattedPriceArray} scroll={{ y: 240 }} pagination={false} />
                  </div>
                  <Space size="middle">
                    <Button onClick={onClickInitAsset}>Initialize Asset</Button>
                    <Button onClick={onClickUpdatePrice}>Update Price</Button>
                    <Button onClick={onClickFetchPrice}>Fetch Price</Button>
                  </Space>
                </Container>
              </Col>
            </Row>
          </PageContainer>
        </Content>
      </Layout>

    </Space>
  );
}

export default ArthSwapApp;
