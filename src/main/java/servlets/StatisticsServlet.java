package servlets;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import database.DB_Connection;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class StatisticsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (Connection con = DB_Connection.getConnection(); Statement stmt = con.createStatement()) {
            JsonObject json = new JsonObject();

            /* 1 */
            ResultSet rs = stmt.executeQuery("SELECT incident_type, COUNT(*) AS count FROM incidents GROUP BY incident_type");
            JsonArray incidentsPerType = new JsonArray();
            while (rs.next()) {
                JsonObject obj = new JsonObject();
                obj.addProperty("type", rs.getString("incident_type"));
                obj.addProperty("count", rs.getInt("count"));
                incidentsPerType.add(obj);
            }
            json.add("incidentsPerType", incidentsPerType);

            /* 2 */

            JsonObject userVolunteerCount = new JsonObject();

            rs = stmt.executeQuery("SELECT COUNT(*) AS count FROM users");
            if (rs.next()) {
                userVolunteerCount.addProperty("users", rs.getInt("count"));
            }

            rs = stmt.executeQuery("SELECT COUNT(*) AS count FROM volunteers");
            if (rs.next()) {
                userVolunteerCount.addProperty("volunteers", rs.getInt("count"));
            }

            json.add("userVolunteerCount", userVolunteerCount);

            /* 3 */

            int totalVehicles = 0;
            int totalFiremen = 0;

            rs = stmt.executeQuery("SELECT volunteer_type FROM participants WHERE status IN ('accepted', 'finished')");
            while (rs.next()) {
                String type = rs.getString("volunteer_type");
                if ("driver".equalsIgnoreCase(type)) {
                    totalVehicles++;
                } else if ("simple".equalsIgnoreCase(type)) {
                    totalFiremen++;
                }
            }

            JsonArray resourcesUsage = new JsonArray();

            JsonObject firemenObj = new JsonObject();
            firemenObj.addProperty("resource", "Firemen");
            firemenObj.addProperty("count", totalFiremen);
            resourcesUsage.add(firemenObj);

            JsonObject vehiclesObj = new JsonObject();
            vehiclesObj.addProperty("resource", "Vehicles");
            vehiclesObj.addProperty("count", totalVehicles);
            resourcesUsage.add(vehiclesObj);

            json.add("resourcesUsage", resourcesUsage);

            response.getWriter().write(json.toString());
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"An error occurred while fetching statistics\"}");
        }
    }

}