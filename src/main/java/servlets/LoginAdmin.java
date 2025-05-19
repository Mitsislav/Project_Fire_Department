package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.DB_Connection;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class LoginAdmin extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        /* getting username and password from the request parameter */

        String password = request.getParameter("password");
        String username="admin";

        JsonObject responseJson = new JsonObject();

        /* database connection via DB_Connection class and create the SQL statement */

        try (Connection con = DB_Connection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT * FROM users WHERE username = ? AND password = ?")) {

            /* replace the placeholders (?) with the real values */

            ps.setString(1, username);
            ps.setString(2, password);

            /* Execute the query */

            ResultSet rs = ps.executeQuery();

            if(rs.next()){
                /* found */
                responseJson.addProperty("success", true); /* success login */

                responseJson.addProperty("username", rs.getString("username"));
                responseJson.addProperty("password", rs.getString("password"));
                /*
                responseJson.addProperty("username", rs.getString("username"));
                responseJson.addProperty("firstname", rs.getString("firstname"));
                responseJson.addProperty("lastname", rs.getString("lastname"));
                responseJson.addProperty("email", rs.getString("email"));
                responseJson.addProperty("password", rs.getString("password"));
                responseJson.addProperty("birthdate", rs.getString("birthdate"));
                responseJson.addProperty("gender", rs.getString("gender"));
                responseJson.addProperty("afm", rs.getString("afm"));
                responseJson.addProperty("country", rs.getString("country"));
                responseJson.addProperty("address", rs.getString("address"));
                responseJson.addProperty("municipality", rs.getString("municipality"));
                responseJson.addProperty("prefecture", rs.getString("prefecture"));
                responseJson.addProperty("job", rs.getString("job"));
                responseJson.addProperty("telephone", rs.getString("telephone"));*/

                /* save the cookie with user's data and add it to response json object */
                /*
                JsonObject userData = new JsonObject();
                userData.addProperty("username", rs.getString("username"));
                userData.addProperty("firstname", rs.getString("firstname"));
                userData.addProperty("lastname", rs.getString("lastname"));
                userData.addProperty("email", rs.getString("email"));
                userData.addProperty("password", rs.getString("password"));
                userData.addProperty("birthdate", rs.getString("birthdate"));
                userData.addProperty("gender", rs.getString("gender"));
                userData.addProperty("afm", rs.getString("afm"));
                userData.addProperty("country", rs.getString("country"));
                userData.addProperty("address", rs.getString("address"));
                userData.addProperty("municipality", rs.getString("municipality"));
                userData.addProperty("prefecture", rs.getString("prefecture"));
                userData.addProperty("job", rs.getString("job"));
                userData.addProperty("telephone", rs.getString("telephone"));

                String encodedUserData = URLEncoder.encode(userData.toString(), "UTF-8");

                Cookie loginCookie = new Cookie("userData", encodedUserData);
                loginCookie.setMaxAge(24 * 60 * 60);
                response.addCookie(loginCookie);
                */
            }else{
                /* username with this password not found */
                responseJson.addProperty("success", false);
            }
            /* send the JSON object back to ajax */

            response.getWriter().write(responseJson.toString());
            System.out.println(responseJson);
        }catch (Exception e){
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try(BufferedReader reader = request.getReader()){
            /* use Gson to convert JSON to Java object */

            Gson gson = new Gson();
            JsonObject requestBody = gson.fromJson(reader, JsonObject.class);

            /* taking the values from the json request */

            String username = requestBody.get("username").getAsString();
            String password = requestBody.get("password").getAsString();

            /* connection to the database and making the SQL statement again */

            try(Connection con = DB_Connection.getConnection();
                PreparedStatement ps = con.prepareStatement(
                        "UPDATE users SET password = ? WHERE username = ?")) {

                /* replace the placeholders ( ? ) to the statement according to the index */


                ps.setString(1, password);
                ps.setString(2, username);

                /* execute the query statement */

                int rowsUpdated = ps.executeUpdate();

                JsonObject responseJson = new JsonObject();
                if (rowsUpdated > 0) { /* success UPDATE */
                    responseJson.addProperty("success", true);
                    responseJson.addProperty("message", "Profile updated successfully.");

                    /* update cookie value */
                    JsonObject updatedUserData = new JsonObject();
                    updatedUserData.addProperty("username", username);
                    updatedUserData.addProperty("password", password);

                    String updatedUserDataEncoded = URLEncoder.encode(updatedUserData.toString(), "UTF-8");
                    Cookie updatedCookie = new Cookie("userData", updatedUserDataEncoded);
                    updatedCookie.setMaxAge(24 * 60 * 60);
                    response.addCookie(updatedCookie);

                } else { /* failed change */
                    responseJson.addProperty("success", false);
                    responseJson.addProperty("message", "Failed to change the password.");
                }
                /* send json response back to client(ajax) */

                response.getWriter().write(responseJson.toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"Server error\"}");
        }
    }


}