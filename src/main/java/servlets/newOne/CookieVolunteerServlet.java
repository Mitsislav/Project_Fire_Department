package servlets.newOne;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonObject;

public class CookieVolunteerServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject jsonResponse = new JsonObject();
        try {
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                jsonResponse.addProperty("loggedIn", false);
                response.getWriter().write(jsonResponse.toString());
                return;
            }

            String volunteerData = null;
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("volunteerData")) {
                    volunteerData = cookie.getValue();
                }
            }

            if (volunteerData != null) {
                jsonResponse.addProperty("loggedIn", true);
                jsonResponse.addProperty("data", volunteerData);
            } else {
                jsonResponse.addProperty("loggedIn", false);
            }

            response.getWriter().write(jsonResponse.toString());
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("loggedIn", false);
            jsonResponse.addProperty("error", "Server encountered an error");
            response.getWriter().write(jsonResponse.toString());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Cookie cookie = new Cookie("volunteerData", "");
        cookie.setMaxAge(0); /* cookie is going to expire right now*/
        response.addCookie(cookie);

        /* return success*/
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", true);
        response.getWriter().write(responseJson.toString());
    }
}
