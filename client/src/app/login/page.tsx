"use client";

import React, { useState } from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [cognitoId, setCognitoId] = useState("");
  const [error, setError] = useState("");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, cognitoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Неверное имя пользователя или пароль");
      }

      const data = await response.json();
      // Сохраняем токен в localStorage
      localStorage.setItem("token", data.token);
      router.push("/home"); // Перенаправляем на главную страницу
    } catch (err: any) {
      setError(err.message || "Ошибка при входе");
    }
  };

  return (
    <div className="h-full w-full bg-gray-100 dark:bg-dark-secondary p-8">
      <Header name="Вход" />
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow dark:bg-dark-secondary dark:border dark:border-stroke-dark">
          <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">
            Вход в систему
          </h2>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2 dark:text-gray-200"
              >
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
            <div className="mb-6">
              <label
                htmlFor="cognitoId"
                className="block text-sm font-medium mb-2 dark:text-gray-200"
              >
                Пароль (Cognito ID)
              </label>
              <input
                type="password"
                id="cognitoId"
                value={cognitoId}
                onChange={(e) => setCognitoId(e.target.value)}
                className="w-full rounded border p-3 shadow-sm dark:bg-dark-tertiary dark:border-stroke-dark dark:text-gray-200"
                placeholder="Введите пароль"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;