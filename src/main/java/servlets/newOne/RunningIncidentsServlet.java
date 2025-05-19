package servlets.newOne;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import mainClasses.Incident;
import database.tables.EditIncidentsTable;
import javax.servlet.http.Cookie;


public class RunningIncidentsServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Get volunteer type from cookies
        String volunteerType = getVolunteerTypeFromCookies(request);

        List<Incident> incidents = fetchRunningIncidentsFromDatabase(volunteerType);

        Gson gson = new Gson();
        String jsonResponse = gson.toJson(incidents);

        PrintWriter out = response.getWriter();
        out.print(jsonResponse);
        out.flush();
    }

    private String getVolunteerTypeFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("volunteerData")) {
                    try {
                        String decoded = java.net.URLDecoder.decode(cookie.getValue(), "UTF-8");
                        com.google.gson.JsonObject json = new Gson().fromJson(decoded, com.google.gson.JsonObject.class);
                        return json.get("volunteer_type").getAsString();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        return null;
    }

    private List<Incident> fetchRunningIncidentsFromDatabase(String volunteerType) {
        List<Incident> incidents = new ArrayList<>();
        try {
            EditIncidentsTable incidentsTable = new EditIncidentsTable();
            List<Incident> allIncidents = incidentsTable.databaseToIncidentsSearch("all", "running", "all");

            for (Incident incident : allIncidents) {
                if ("simple".equals(volunteerType) && incident.getFiremen() > 0) {
                    incidents.add(incident);
                } else if ("driver".equals(volunteerType) && incident.getVehicles() > 0) {
                    incidents.add(incident);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return incidents;
    }
}

