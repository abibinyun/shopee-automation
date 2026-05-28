import React, { useContext, useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import axiosInstance, { API_URL } from "../services/axios";
import { AuthContext } from "../context/AuthContext";

const ChangePass = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { logout } = useContext(AuthContext);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await axiosInstance.put(`${API_URL}/api/user`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success("Password berhasil diperbarui!");
      form.resetFields();

      logout()
    } catch (error) {
      message.error(error.response?.data?.error || "Gagal mengupdate password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Ganti Password" style={{ maxWidth: 400, margin: "auto", marginTop: 50 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Password Saat Ini"
        name="currentPassword"
        rules={[
            { required: true, message: "Masukkan password lama" },
            ({ getFieldValue }) => ({
            validator: async (_, value) => {
                if (!value) return Promise.reject("Masukkan password lama");

                try {
                await axiosInstance.post(`${API_URL}/api/user/password`, { password: value });
                return Promise.resolve();
                } catch (error) {
                return Promise.reject("Password lama salah");
                }
            },
            }),
        ]}
        >
            <Input.Password placeholder="Masukkan password lama" />
        </Form.Item>

        <Form.Item
          label="Password Baru"
          name="newPassword"
          rules={[
            { required: true, message: "Masukkan password baru" },
            { min: 8, message: "Password minimal 8 karakter" },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
              message: "Harus mengandung huruf dan angka",
            },
          ]}
        >
          <Input.Password placeholder="Masukkan password baru" />
        </Form.Item>

        <Form.Item
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Ulangi password baru" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Password tidak cocok"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Ulangi password baru" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Simpan Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePass;
