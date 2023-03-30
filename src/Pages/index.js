import React, { useEffect } from "react";
import * as XLSX from "xlsx/xlsx";
import QRCode from "react-qr-code";

import {
  Button,
  message,
  Upload,
  Row,
  Col,
  Space,
  Input,
  Table,
  Image,
  Typography,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";

const userKeyRegExp = /^[A-Z]\-[A-Z]\-[0-9]{2}\-[0-9]{3}?$/;

const convert = (item) => {
  const prefix = item.slice(0, 2);
  const digits = item.slice(2);
  const converted =
    prefix[0] +
    "-" +
    prefix[1] +
    "-" +
    digits.slice(0, 2) +
    "-" +
    digits.slice(2);
  return converted;
};

const MainPage = () => {
  const [excelData, setExcelData] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [basketValue, setBasketValue] = React.useState("A-B-53-004");
  const timeoutRef = React.useRef();

  const onSearch = (e) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSearchValue(e.target.value);
    }, 300);
  };

  const onChangeBasket = (value) => {
    if (userKeyRegExp.test(value)) {
      setBasketValue(value);
    } else {
      message.error(`${value} không đúng format`);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isExcel = file.name.includes("xls");
      if (!isExcel) {
        message.error(`${file.name} không phải là file excel`);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const fileData = reader.result;
          const workbook = XLSX.read(fileData, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);
          setExcelData(data);
        };
        reader.readAsBinaryString(file);
      }
      return false;
    },
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "__rowNum__",
      align: "center",
    },
    {
      title: "Mã hàng",
      dataIndex: "product_id",
      align: "center",
      render: (_, record) => (
        <Typography.Title level={5} style={{ color: "#4096ff" }}>
          {record.product_id}
        </Typography.Title>
      ),
    },
    {
      title: "Mã hàng QR Code",
      align: "center",
      render: (_, record) => (
        <>
          <QRCode
            size={20}
//             bgColor="#4096ff"
            style={{ height: "auto", maxWidth: "160px", width: "160px" }}
            value={record.product_id}
          />
        </>
      ),
    },
    {
      title: "SL Tồn",
      dataIndex: "remain_quantity",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "basket_location",
      render: (_, record) => (
        <>
          {userKeyRegExp.test(record.basket_location) ? (
            <Typography.Title level={5} style={{ color: "red" }}>
              {record.basket_location}
            </Typography.Title>
          ) : record.basket_location.length === 7 ? (
            <Space direction="vertical" size={0} style={{ margin: 0 }}>
              <Typography.Title level={5} delete>
                {record.basket_location}
              </Typography.Title>
              <Typography.Title level={5} style={{ color: "red" }}>
                {convert(record.basket_location)}
              </Typography.Title>
            </Space>
          ) : (
            <Space direction="vertical" size={0} style={{ margin: 0 }}>
              <Typography.Title level={5} delete>
                {record.basket_location}
              </Typography.Title>
              <Typography.Title level={5} style={{ color: "red" }}>
                {basketValue}
              </Typography.Title>
            </Space>
          )}
        </>
      ),
      align: "center",
    },
    {
      title: "Vị trí QR Code",
      align: "center",
      render: (_, record) => (
        <>
          {userKeyRegExp.test(record.basket_location) ? (
            <QRCode
              size={20}
              style={{ height: "auto", maxWidth: "160px", width: "160px" }}
              value={record.basket_location}
              bgColor="red"
            />
          ) : record.basket_location.length === 7 ? (
            <QRCode
              size={20}
              style={{ height: "auto", maxWidth: "160px", width: "160px" }}
              value={convert(record.basket_location)}
              bgColor="red"
            />
          ) : (
            <QRCode
              size={20}
              style={{ height: "auto", maxWidth: "160px", width: "160px" }}
              value={basketValue}
              bgColor="red"
            />
          )}
        </>
      ),
    },
  ];

  const tableData = excelData.filter((item) =>
    item.product_id.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      <div
        style={{
          border: "1px solid blue",
          borderRadius: 12,
          margin: "60px 60px",
        }}
      >
        <Row style={{ padding: "20px 20px" }}>
          <Col span={24}>
            <Space>
              <Upload {...uploadProps} showUploadList={false}>
                <Button icon={<UploadOutlined />} type="primary">
                  Nhập file excel
                </Button>
              </Upload>
              <Input.Search
                placeholder="Nhập mã hàng"
                allowClear
                enterButton="Tìm kiếm"
                onChange={onSearch}
              />
              <Input.Search
                placeholder="Giá trị mặc định là A-B-53-004"
                allowClear
                enterButton="Thay đổi"
                onSearch={onChangeBasket}
                style={{ width: 360 }}
              />
            </Space>
          </Col>
          <Col span={24}>
            {excelData.length !== 0
              ? `Có tất cả ${excelData.length} mã hàng`
              : null}
            <Table
              style={{ marginTop: 30 }}
              bordered
              columns={columns}
              dataSource={tableData}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default MainPage;
