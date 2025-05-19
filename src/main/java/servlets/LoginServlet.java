package servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.DB_Connection;
import database.tables.CheckForDuplicatesExample;
import database.tables.EditUsersTable;
import javax.servlet.*;
import javax.servlet.http.*;


public class LoginServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        /* getting username and password from the request parameter */

        String username = request.getParameter("username");
        String password = request.getParameter("password");

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
                responseJson.addProperty("lat", rs.getString("lat"));
                responseJson.addProperty("lon", rs.getString("lon"));
                responseJson.addProperty("job", rs.getString("job"));
                responseJson.addProperty("telephone", rs.getString("telephone"));

                /* save the cookie with user's data and add it to response json object */

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
                userData.addProperty("lat", rs.getString("lat"));
                userData.addProperty("lon", rs.getString("lon"));
                userData.addProperty("telephone", rs.getString("telephone"));

                String encodedUserData = URLEncoder.encode(userData.toString(), "UTF-8");

                Cookie loginCookie = new Cookie("userData", encodedUserData);
                loginCookie.setMaxAge(24 * 60 * 60); /* cookie will expire in 1 day*/
                response.addCookie(loginCookie);

                //System.out.println("Set Cookie: " + loginCookie.getName() + " = " + loginCookie.getValue());

                Cookie[] cookies = request.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        //System.out.println("Received Cookie: " + cookie.getName() + " = " + cookie.getValue());
                    }
                }
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try(BufferedReader reader = request.getReader()){
            /* use Gson to convert JSON to Java object */

            Gson gson = new Gson();
            JsonObject requestBody = gson.fromJson(reader, JsonObject.class);

            /* taking the values from the json request */

            String username = requestBody.get("username").getAsString();
            String firstname = requestBody.get("firstname").getAsString();
            String lastname = requestBody.get("lastname").getAsString();
            String email = requestBody.get("email").getAsString();
            String password = requestBody.get("password").getAsString();
            String birthdate = requestBody.get("birthdate").getAsString();
            String gender = requestBody.get("gender").getAsString();
            String country = requestBody.get("country").getAsString();
            String address = requestBody.get("address").getAsString();
            String municipality = requestBody.get("municipality").getAsString();
            String prefecture = requestBody.get("prefecture").getAsString();
            String lat = requestBody.get("lat").getAsString();
            String lon = requestBody.get("lon").getAsString();
            String job = requestBody.get("job").getAsString();

            /* taking these values for cookies */

            String afm=requestBody.get("afm").getAsString();
            String telephone=requestBody.get("telephone").getAsString();

            /* connection to the database and making the SQL statement again */

            try(Connection con = DB_Connection.getConnection();
                 PreparedStatement ps = con.prepareStatement(
                         "UPDATE users SET firstname = ?, lastname = ?, email = ?, password = ?, birthdate = ?, gender = ?, country = ?, address = ?, municipality = ?, prefecture = ?, lat = ?, lon = ?, job = ? WHERE username = ?")) {

                /* replace the placeholders ( ? ) to the statement according to the index */

                ps.setString(1, firstname);
                ps.setString(2, lastname);
                ps.setString(3, email);
                ps.setString(4, password);
                ps.setString(5, birthdate);
                ps.setString(6, gender);
                ps.setString(7, country);
                ps.setString(8, address);
                ps.setString(9, municipality);
                ps.setString(10, prefecture);
                ps.setString(11, lat);
                ps.setString(12, lon);
                ps.setString(13, job);
                ps.setString(14, username);

                /* execute the query statement */

                int rowsUpdated = ps.executeUpdate();

                JsonObject responseJson = new JsonObject();
                if (rowsUpdated > 0) { /* success UPDATE */
                    responseJson.addProperty("success", true);
                    responseJson.addProperty("message", "Profile updated successfully.");

                    /* update cookie value */
                    JsonObject updatedUserData = new JsonObject();
                    updatedUserData.addProperty("username", username);
                    updatedUserData.addProperty("firstname", firstname);
                    updatedUserData.addProperty("lastname", lastname);
                    updatedUserData.addProperty("email", email);
                    updatedUserData.addProperty("password", password);
                    updatedUserData.addProperty("birthdate", birthdate);
                    updatedUserData.addProperty("gender", gender);
                    updatedUserData.addProperty("afm", afm);   /* */
                    updatedUserData.addProperty("telephone", telephone); /* */
                    updatedUserData.addProperty("country", country);
                    updatedUserData.addProperty("address", address);
                    updatedUserData.addProperty("municipality", municipality);
                    updatedUserData.addProperty("prefecture", prefecture);
                    updatedUserData.addProperty("lat", lat);
                    updatedUserData.addProperty("lon", lon);
                    updatedUserData.addProperty("job", job);

                    String updatedUserDataEncoded = URLEncoder.encode(updatedUserData.toString(), "UTF-8");
                    Cookie updatedCookie = new Cookie("userData", updatedUserDataEncoded);
                    updatedCookie.setMaxAge(24 * 60 * 60);
                    response.addCookie(updatedCookie);

                } else { /* failed change */
                    responseJson.addProperty("success", false);
                    responseJson.addProperty("message", "Failed to update profile.");
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