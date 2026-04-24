/**
 * Authentication API Client
 * This version strictly avoids .join() and delegates all complex error formatting
 * to the UI layer's safety functions to prevent runtime crashes.
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * Login process
 */
export const login = async (email, password) => {
  const response = await fetch('/users/sign_in.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify({
      user: { email, password }
    })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error('Connection error: Server returned unexpected content.');
  }

  const data = await response.json();
  
  if (!response.ok) {
    // We do NOT use .join() here.
    throw { message: data.error || 'Invalid email or password.' };
  }
  
  return data;
};

/**
 * Sign up process
 * Absolutely no .join() calls allowed in this function.
 */
export const signUp = async (username, email, password, passwordConfirmation) => {
  const response = await fetch('/users.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify({
      user: {
        name: username, 
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
      }
    })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error('Server configuration error. Please contact support.');
  }

  const data = await response.json();

  if (!response.ok) {
    // 修正ポイント: ここで配列操作(join)をせず、errorsオブジェクトをそのまま投げる。
    // UI側の safeToString がこれを安全に解析して表示する。
    throw { 
      message: data.errors || data.message || 'Registration failed' 
    };
  }

  return data;
};