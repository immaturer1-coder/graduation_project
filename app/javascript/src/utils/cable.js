import { createConsumer } from '@rails/actioncable';

/**
 * 実行環境に合わせてActionCable（WebSocket）の接続URLを動的に生成する関数
 */
const getCableUrl = () => {
  if (typeof window === 'undefined') return '';
  // サイトがHTTPSならWebSocketもセキュアなwssに、HTTPならwsに自動で切り替えます
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/cable`;
};

let consumer = null;

/**
 * ActionCableのコンシューマー（接続インスタンス）を取得・再利用するヘルパー
 */
export const getConsumer = () => {
  if (!consumer && typeof window !== 'undefined') {
    consumer = createConsumer(getCableUrl());
  }
  return consumer;
};