module.exports = 
class Contact{
    constructor(name, email, phone)
    {
        this.Id = 0;
        this.Name = name !== undefined ? name : "";
        this.Email = undefined ? email : "";
        this.Phone = undefined ? phone : "";
    }
}