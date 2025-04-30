export function SignupFormValidate(a,b,c,d,e){
    if(a.trim().length==0||b.trim().length==0||c.trim().length==0||d.trim().length==0||e.trim().length==0){
        return "No input field should be empty!!"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(c)){
        return "Your email is invalid!!"
    }
    if (b.length !== 10 || isNaN(b) || b.trim().length !== 10) {
        return "Mobile number should contain 10 digits!!";
    }
    if(d.trim().length<6){
        return "Password must be at least 6 characters."

    }
    if(d.trim()!=e){
        return "password is mismatch with confirm password"
    }

}