package servlets;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.net.URLDecoder;

import com.google.gson.JsonObject;
import com.google.gson.Gson;

public class CookieServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject responseJson = new JsonObject();

        Cookie[] cookies = request.getCookies(); /* taking all the cookies from the response */
        if(cookies != null){ /* checking if there are any cookies */
            for(Cookie cookie : cookies){ /* searching a cookie named userData */
                if(cookie.getName().equals("userData")){
                    /* decoding the cookie value */
                    String decodedValue = URLDecoder.decode(cookie.getValue(), "UTF-8");
                    /* assign the decoded form of cookie to a json object */
                    JsonObject userData = new Gson().fromJson(decodedValue, JsonObject.class);

                    /* if user is logged in then a JSON with their data is returned as response */
                    responseJson.addProperty("loggedIn", true);

                    if (userData.has("lat") && userData.has("lon")) {
                        responseJson.addProperty("lat", userData.get("lat").getAsString());
                        responseJson.addProperty("lon", userData.get("lon").getAsString());
                    }

                    responseJson.add("data", userData);
                    response.getWriter().write(responseJson.toString());
                    return;
                }
            }
        }
        /* if the cookie does not exist then the user is not connected */

        responseJson.addProperty("loggedIn", false);
        response.getWriter().write(responseJson.toString());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Cookie cookie = new Cookie("userData", "");
        cookie.setMaxAge(0); /* cookie is going to expire right now*/
        response.addCookie(cookie);

        /* return success*/
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", true);
        response.getWriter().write(responseJson.toString());
    }
}