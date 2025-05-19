package servlets.newOne;
import database.DB_Connection;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class LoginVolunteerServlet extends HttpServlet
{
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
                     "SELECT * FROM volunteers WHERE username = ? AND password = ?")) {

            ps.setString(1, username);
            ps.setString(2, password);

            /* Execute the query */
            ResultSet rs = ps.executeQuery();

            if (rs.next())
            {
                /* found */
                responseJson.addProperty("success", true); /* success login */

                /* Adding volunteer information to the JSON object */
                responseJson.addProperty("volunteer_id", rs.getString("volunteer_id"));
                responseJson.addProperty("username", rs.getString("username"));
                responseJson.addProperty("firstname", rs.getString("firstname"));
                responseJson.addProperty("lastname", rs.getString("lastname"));
                responseJson.addProperty("email", rs.getString("email"));
                responseJson.addProperty("password", rs.getString("password"));
                responseJson.addProperty("birthdate", rs.getString("birthdate"));
                responseJson.addProperty("gender", rs.getString("gender"));
                responseJson.addProperty("country", rs.getString("country"));
                responseJson.addProperty("address", rs.getString("address"));
                responseJson.addProperty("municipality", rs.getString("municipality"));
                responseJson.addProperty("prefecture", rs.getString("prefecture"));
                responseJson.addProperty("job", rs.getString("job"));
                responseJson.addProperty("telephone", rs.getString("telephone"));
                responseJson.addProperty("lat", rs.getString("lat"));
                responseJson.addProperty("lon", rs.getString("lon"));
                responseJson.addProperty("volunteer_type", rs.getString("volunteer_type"));
                responseJson.addProperty("height", rs.getString("height"));
                responseJson.addProperty("weight", rs.getString("weight"));

                /* save the cookie with volunteer's data and add it to response JSON object */
                JsonObject volunteerData = new JsonObject();
                volunteerData.addProperty("volunteer_id", rs.getString("volunteer_id"));
                volunteerData.addProperty("username", rs.getString("username"));
                volunteerData.addProperty("firstname", rs.getString("firstname"));
                volunteerData.addProperty("lastname", rs.getString("lastname"));
                volunteerData.addProperty("email", rs.getString("email"));
                volunteerData.addProperty("password", rs.getString("password"));
                volunteerData.addProperty("birthdate", rs.getString("birthdate"));
                volunteerData.addProperty("gender", rs.getString("gender"));
                volunteerData.addProperty("country", rs.getString("country"));
                volunteerData.addProperty("address", rs.getString("address"));
                volunteerData.addProperty("municipality", rs.getString("municipality"));
                volunteerData.addProperty("prefecture", rs.getString("prefecture"));
                volunteerData.addProperty("job", rs.getString("job"));
                volunteerData.addProperty("lat", rs.getString("lat"));
                volunteerData.addProperty("lon", rs.getString("lon"));
                volunteerData.addProperty("volunteer_type", rs.getString("volunteer_type"));
                volunteerData.addProperty("height", rs.getString("height"));
                volunteerData.addProperty("weight", rs.getString("weight"));
                volunteerData.addProperty("telephone", rs.getString("telephone"));

                String encodedVolunteerData = URLEncoder.encode(volunteerData.toString(), "UTF-8");

                Cookie loginCookie = new Cookie("volunteerData", encodedVolunteerData);
                loginCookie.setMaxAge(24 * 60 * 60); /* cookie will expire in 1 day */
                response.addCookie(loginCookie);

            } else {
                /* username with this password not found */
                responseJson.addProperty("success", false);
                responseJson.addProperty("message", "Invalid credentials or volunteer not found.");
            }
            /* send the JSON object back to ajax */
            response.getWriter().write(responseJson.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"Server error\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (BufferedReader reader = request.getReader()) {
            /* use Gson to convert JSON to Java object */
            Gson gson = new Gson();
            JsonObject requestBody = gson.fromJson(reader, JsonObject.class);

            /* taking the values from the json request */
            String id = requestBody.get("volunteer_id").getAsString();
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
            String job = requestBody.get("job").getAsString();
            String afm=requestBody.get("afm").getAsString();
            String telephone=requestBody.get("telephone").getAsString();
            String lat = requestBody.get("lat").getAsString();
            String lon = requestBody.get("lon").getAsString();
            String volunteerType = requestBody.get("volunteer_type").getAsString();
            String height = requestBody.get("height").getAsString();
            String weight = requestBody.get("weight").getAsString();

            /* connection to the database and making the SQL statement again */
            try (Connection con = DB_Connection.getConnection();
                 PreparedStatement ps = con.prepareStatement(
                         "UPDATE volunteers SET firstname = ?, lastname = ?, email = ?, password = ?, birthdate = ?, gender = ?, country = ?, address = ?, municipality = ?, prefecture = ?, job = ?, lat = ?, lon = ?, volunteer_type = ?, height = ?, weight = ? WHERE username = ?")) {

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
                ps.setString(11, job);
                ps.setString(12, lat);
                ps.setString(13, lon);
                ps.setString(14, volunteerType);
                ps.setString(15, height);
                ps.setString(16, weight);
                ps.setString(17, username);

                /* execute the query statement */
                int rowsUpdated = ps.executeUpdate();

                JsonObject responseJson = new JsonObject();
                if (rowsUpdated > 0) { /* success UPDATE */
                    responseJson.addProperty("success", true);
                    responseJson.addProperty("message", "Volunteer profile updated successfully.");

                    /* update cookie value */
                    JsonObject updatedVolunteerData = new JsonObject();
                    updatedVolunteerData.addProperty("volunteer_id",id);
                    updatedVolunteerData.addProperty("username", username);
                    updatedVolunteerData.addProperty("firstname", firstname);
                    updatedVolunteerData.addProperty("lastname", lastname);
                    updatedVolunteerData.addProperty("email", email);
                    updatedVolunteerData.addProperty("password", password);
                    updatedVolunteerData.addProperty("birthdate", birthdate);
                    updatedVolunteerData.addProperty("gender", gender);
                    updatedVolunteerData.addProperty("country", country);
                    updatedVolunteerData.addProperty("address", address);
                    updatedVolunteerData.addProperty("municipality", municipality);
                    updatedVolunteerData.addProperty("prefecture", prefecture);
                    updatedVolunteerData.addProperty("job", job);
                    updatedVolunteerData.addProperty("afm", afm);
                    updatedVolunteerData.addProperty("telephone", telephone);
                    updatedVolunteerData.addProperty("lat", lat);
                    updatedVolunteerData.addProperty("lon", lon);
                    updatedVolunteerData.addProperty("volunteer_type", volunteerType);
                    updatedVolunteerData.addProperty("height", height);
                    updatedVolunteerData.addProperty("weight", weight);

                    String updatedVolunteerDataEncoded = URLEncoder.encode(updatedVolunteerData.toString(), "UTF-8");
                    Cookie updatedCookie = new Cookie("volunteerData", updatedVolunteerDataEncoded);
                    updatedCookie.setMaxAge(24 * 60 * 60); // 1 day expiry
                    response.addCookie(updatedCookie);

                }
                else /* failed change */
                {
                    responseJson.addProperty("success", false);
                    responseJson.addProperty("message", "Failed to update volunteer profile.");
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