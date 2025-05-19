function goto(where)
{
    switch (where)
    {
        case 'map':
            window.location.href = "map.html";
            break;
        case 'user':
            window.location.href = "../login.html";
            break;
        case 'volunteer':
            window.location.href = "../volunteer/loginVolunteer.html";
            break;
        case 'admin':
            window.location.href = "../loginAdmin.html";
            break;
        default:
            console.error("Invalid redirection: " + where);
    }
}