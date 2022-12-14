const CreateUserService = require("./CreateUserService");
const RepositoryInMemory = require("../../repositories/RepositoryInMemory");
const appError = require("../../util/appError")

describe("User services", () => {
  let repositoryInMemory;
  let UserService;

  beforeEach(() => {
    repositoryInMemory= new RepositoryInMemory();
    UserService = new CreateUserService(repositoryInMemory);
  })

  it("User should be registered", async () => {
    
    const user = {
      name: "Rafael Test",
      email: "email@email.com",
      password: "123"
    }

    const userCreated = await UserService.create(user);

    expect(userCreated).toHaveProperty("id");
  })

  it("User's email don't be duplicated", async () => {
    const user01 = {
      name: "Rafael Test",
      email: "email@email.com",
      password: "123"
    }

    const user02 = {
      name: "Rafael Test",
      email: "email@email.com",
      password: "123"
    }

    await UserService.create(user01);
    expect(async () => {
      await UserService.create(user02);
    }).rejects.toEqual(new appError("Este email já está uso"));

    // await expect(UserService.create(user02)).rejects.toEqual(new appError("teste"));
  })

  it("User's new password must be equal to current password", async () => {
    const updatedUser = {
      id: 1,
      name: "Rafael Test",
      email: "email@email.com",
      password: "abc",
      old_password: "1234", // correct password = "123"
    }
    
    expect(async () =>{ 
      await UserService.update(updatedUser)
    }).rejects.toEqual(new appError("A senha atual está incorreta."));
    
  })

}) 