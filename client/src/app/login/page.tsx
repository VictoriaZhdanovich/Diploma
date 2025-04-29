'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/redux';
import { setCurrentUser } from '@/state';
import { useGetAuthUserQuery } from '@/state/api';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: authUserData, refetch } = useGetAuthUserQuery(undefined, {
    skip: !localStorage.getItem('token'),
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Новое состояние для видимости пароля

  useEffect(() => {
    if (authUserData?.userDetails) {
      dispatch(setCurrentUser(authUserData.userDetails));
      if (authUserData.userDetails.forcePasswordChange) {
        router.push('/change-password');
      } else {
        router.push('/home');
      }
    }
  }, [authUserData, dispatch, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при входе');
      }

      const { token, userDetails } = await response.json();
      localStorage.setItem('token', token);
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-dark-secondary p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow dark:bg-dark-secondary dark:border dark:border-stroke-dark">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border p-3 shadow-sm dark:bg-dark-tertiary dark:border-stroke-dark dark:text-gray-200"
              placeholder="Введите имя пользователя"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} // Переключаем тип поля
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border p-3 shadow-sm dark:bg-dark-tertiary dark:border-stroke-dark dark:text-gray-200"
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'} {/* Эмодзи для переключения */}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-400 text-white py-3 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;