package servlets;

import java.io.IOException;
import java.io.PrintWriter;

import java.util.Collections;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import mainClasses.Incident;
import database.tables.EditIncidentsTable;

public class RunningIncidentsUserServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        List<Incident> incidents = fetchRunningIncidentsFromDatabase();

        Gson gson = new Gson();
        String jsonResponse = gson.toJson(incidents);

        PrintWriter out = response.getWriter();
        out.print(jsonResponse);
        out.flush();
    }

    private List<Incident> fetchRunningIncidentsFromDatabase() {
        List<Incident> allIncidents = Collections.emptyList();
        try {
            EditIncidentsTable incidentsTable = new EditIncidentsTable();
            allIncidents = incidentsTable.databaseToIncidentsSearch("all", "running", "all");

        } catch (Exception e) {
            e.printStackTrace();
        }
        return allIncidents;
    }
}