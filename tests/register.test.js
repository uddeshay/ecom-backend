require("module-alias/register");
const request = require("supertest");
const app = require("../app");
const User = require("@model/User");

jest.mock("../config/mongo", () => jest.fn());
jest.mock("@model/User");

let server;
beforeAll(() => { server = app.listen(0); });
afterAll(() => server.close());

const registerPayload = {
  email: "test@example.com",
  password: "Test@1234",
  name: "Test User",
  phone: "9876543210",
  address: "123 MG Road Delhi",
  pincode: "110001",
};

describe("POST /auth/register", () => {
  afterEach(() => jest.clearAllMocks());

  it("should register a new user successfully", async () => {
    User.findOne.mockResolvedValue(null); // email already exist nahi karta
    User.create.mockResolvedValue({
      _id: "mockId123",
      name: registerPayload.name,
      email: registerPayload.email,
    });

    const res = await request(server).post("/auth/register").send(registerPayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(1);
    expect(res.body.data.email).toBe(registerPayload.email);
  });

  it("should return error if email already registered", async () => {
    User.findOne.mockResolvedValue({ email: registerPayload.email });

    const res = await request(server).post("/auth/register").send(registerPayload);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe(0);
  });
});
