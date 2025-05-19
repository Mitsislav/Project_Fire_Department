package servlets;

import com.google.gson.Gson;
import database.DB_Connection;
import database.tables.EditIncidentsTable;
import mainClasses.Incident;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;

public class IncidentServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            EditIncidentsTable incidentsTable = new EditIncidentsTable();
            ArrayList<Incident> incidents = incidentsTable.databaseToIncidents();

            Gson gson = new Gson();
            String json = gson.toJson(incidents);
            System.out.println(json);
            response.getWriter().write(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error fetching incidents\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            HashMap<String, String> requestBody = gson.fromJson(reader, HashMap.class);

            String incidentId = requestBody.get("incident_id");
            String description = requestBody.get("description");
            String danger = requestBody.get("danger");
            String firemen = requestBody.get("firemen");
            String vehicles = requestBody.get("vehicles");
            String status = requestBody.get("status");
            String finalResult = requestBody.get("finalResult");
            String start_datetime = requestBody.get("start_datetime");
            String end_datetime = requestBody.get("end_datetime");

            if (incidentId == null || description == null || danger == null || firemen == null || vehicles == null || status == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\": false, \"message\": \"Missing required fields.\"}");
                return;
            }

            EditIncidentsTable editIncidentsTable = new EditIncidentsTable();
            HashMap<String, String> updates = new HashMap<>();
            updates.put("description", description);
            updates.put("danger", danger);
            updates.put("firemen", firemen);
            updates.put("vehicles", vehicles);
            updates.put("status", status);
            updates.put("finalResult", finalResult);
            updates.put("start_datetime", start_datetime);
            updates.put("end_datetime", end_datetime);

            /* checking date time */

            if (start_datetime == null || start_datetime.trim().isEmpty()) {
                updates.put("start_datetime", null);
            } else {
                updates.put("start_datetime", start_datetime);
            }

            if (end_datetime == null || end_datetime.trim().isEmpty()) {
                updates.put("end_datetime", null);
            } else {
                updates.put("end_datetime", end_datetime);
            }

            editIncidentsTable.updateIncident(incidentId, updates);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"success\": true, \"message\": \"Incident Information updated successfully.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while updating the incident.\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {

            String incidentId = request.getParameter("incident_id");

            if (incidentId == null || incidentId.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\": false, \"message\": \"Missing or invalid incident_id.\"}");
                return;
            }

            EditIncidentsTable editIncidentsTable = new EditIncidentsTable();
            editIncidentsTable.deleteIncident(incidentId);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"success\": true, \"message\": \"Incident deleted successfully.\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while deleting the incident.\"}");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while connecting to the database.\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            Incident newIncident = gson.fromJson(reader, Incident.class);

            if (newIncident.getDescription() == null || newIncident.getDanger() == null ||
                    newIncident.getFiremen() == 0 || newIncident.getVehicles() == 0 ||
                    newIncident.getIncident_type() == null || newIncident.getAddress() == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\": false, \"message\": \"Missing required fields.\"}");
                return;
            }

            Connection con = null;
            PreparedStatement pstmt = null;

            try {
                con = DB_Connection.getConnection();

                String insertQuery = "INSERT INTO incidents (incident_type, description, user_phone, user_type, "
                        + "address, lat, lon, municipality, prefecture, start_datetime, danger, status, "
                        + "finalResult, vehicles, firemen) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                pstmt = con.prepareStatement(insertQuery, Statement.RETURN_GENERATED_KEYS);
                pstmt.setString(1, newIncident.getIncident_type());
                pstmt.setString(2, newIncident.getDescription());
                pstmt.setString(3, newIncident.getUser_phone());
                pstmt.setString(4, newIncident.getUser_type());
                pstmt.setString(5, newIncident.getAddress());
                pstmt.setDouble(6, newIncident.getLat());
                pstmt.setDouble(7, newIncident.getLon());
                pstmt.setString(8, newIncident.getMunicipality());
                pstmt.setString(9, newIncident.getPrefecture());
                pstmt.setString(10, newIncident.getStart_datetime());
                pstmt.setString(11, newIncident.getDanger());
                pstmt.setString(12, newIncident.getStatus());
                pstmt.setString(13, newIncident.getFinalResult());
                pstmt.setInt(14, newIncident.getVehicles());
                pstmt.setInt(15, newIncident.getFiremen());

                pstmt.executeUpdate();

                ResultSet rs = pstmt.getGeneratedKeys();
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    newIncident.setIncident_id(generatedId);
                }

                String jsonResponse = gson.toJson(newIncident);
                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write(jsonResponse);
            } catch (SQLException e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while creating the incident.\"}");
            } finally {
                if (pstmt != null) pstmt.close();
                if (con != null) con.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while processing the request.\"}");
        }
    }


    /*
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            Incident newIncident = gson.fromJson(reader, Incident.class);

            if (newIncident.getDescription() == null || newIncident.getDanger() == null ||
                    newIncident.getFiremen() == 0 || newIncident.getVehicles() == 0 ||
                    newIncident.getIncident_type() == null || newIncident.getAddress() == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"success\": false, \"message\": \"Missing required fields.\"}");
                return;
            }

            EditIncidentsTable editIncidentsTable = new EditIncidentsTable();
            editIncidentsTable.createNewIncident(newIncident);

            String jsonResponse = gson.toJson(newIncident);
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write(jsonResponse);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while creating the incident.\"}");
        }
    }
    */
}