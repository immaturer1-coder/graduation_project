import axiosInstance from '../utils/axios';

/**
 * Authentication API Client
 */

/**
 * ログイン処理
 */
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/users/sign_in.json', {
      user: { email, password }
    });
    return response.data;
  } catch (error) {
    // 既存のエラー形式を維持してスロー
    throw { 
      message: error.response?.data?.error || 'Invalid email or password.' 
    };
  }
};

/**
 * 新規登録処理
 */
export const signUp = async (username, email, password, passwordConfirmation) => {
  try {
    const response = await axiosInstance.post('/users.json', {
      user: {
        name: username, 
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
      }
    });
    return response.data;
  } catch (error) {
    // UI側の safeToString 等で処理できるよう、errors オブジェクトをそのまま投げる既存ロジックを維持
    throw { 
      message: error.response?.data?.errors || error.response?.data?.message || 'Registration failed' 
    };
  }
};