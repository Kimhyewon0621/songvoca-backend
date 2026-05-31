const {validateRegisterInfo} = require("../controllers/authController");

//describes : groups the test for each function
describe("utils : validate register information", () =>{
    
    //test : individual test case
    test("returns null when all fields are valid",() => {
        const body = {email : "testemail@example.com", password : "testpassword", name : "testuser"};
        expect(validateRegisterInfo(body)).toBeNull();
    });

    test("returns an error when a required field is missing", () => {
        const body = {email : "testemail@example.com", name : "testuser"};
        expect(validateRegisterInfo(body)).toMatch(/required/);
    });

    test("returns an error when email do not have email format", () => {
        const body = {email : "this-is-not-an-email", password : "testpassword", name : "testuser"};
        expect(validateRegisterInfo(body)).toMatch(/format/);
    });

    test("returns an error when password is less than 6 characters", () => {
        const body = {email : "testemail@example.com", password : "test", name : "testuser"};
        expect(validateRegisterInfo(body)).toMatch(/characters/);
    });
});