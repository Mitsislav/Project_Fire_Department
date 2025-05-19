package servlets;

import com.google.gson.Gson;
import database.DB_Connection;
import database.tables.EditParticipantsTable;
import mainClasses.Incident;
import mainClasses.Participant;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;

public class AdminParticipantsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String status = request.getParameter("status");
            System.out.println(status);
            if (status == null || (!status.equals("requested") && !status.equals("accepted"))) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\": \"Invalid or missing status parameter\"}");
                return;
            }

            EditParticipantsTable participantsTable = new EditParticipantsTable();
            ArrayList<Participant> participants;

            if(status.equals("accepted")){
                participants = participantsTable.databaseToAcceptedParticipants();
                System.out.println("ola kala me ta accepted");
            }else{
                participants = participantsTable.databaseToRequestedParticipants();
                System.out.println("ola kala me ta requested");
            }
            Gson gson = new Gson();
            String json = gson.toJson(participants);

            response.getWriter().write(json);
            response.setStatus(HttpServletResponse.SC_OK);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error retrieving participants\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            Gson gson = new Gson();
            Participant updatedParticipant = gson.fromJson(request.getReader(), Participant.class);
/*
            if (updatedParticipant.getParticipant_id() == 0 || updatedParticipant.getStatus() == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\":\"Invalid participant ID or status\"}");
                return;
            }*/

            EditParticipantsTable participantsTable = new EditParticipantsTable();
            Participant participant = participantsTable.databaseToParticipant(updatedParticipant.getParticipant_id());

            if (participant == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"message\":\"Participant not found\"}");
                return;
            }

            //participant.setStatus(updatedParticipant.getStatus());
            //participantsTable.acceptParticipant(participant.getParticipant_id(), participant.getVolunteer_username());
            if (updatedParticipant.getStatus() != null) {
                participant.setStatus(updatedParticipant.getStatus());
                if ("accepted".equals(updatedParticipant.getStatus())) {
                    int incidentId = participant.getIncident_id();
                    String volunteerType = participant.getVolunteer_type();

                    Connection con = DB_Connection.getConnection();
                    Statement stmt = con.createStatement();

                    ResultSet rs = stmt.executeQuery("SELECT * FROM incidents WHERE incident_id = " + incidentId);
                    if (rs.next()) {
                        int firemen = rs.getInt("firemen");
                        int vehicles = rs.getInt("vehicles");

                        if ("simple".equals(volunteerType)) {
                            firemen = Math.max(firemen - 1, 0);
                        } else if ("driver".equals(volunteerType)) {
                            vehicles = Math.max(vehicles - 1, 0);
                        }

                        String updateQuery = "UPDATE incidents SET firemen = " + firemen + ", vehicles = " + vehicles +
                                " WHERE incident_id = " + incidentId;
                        stmt.executeUpdate(updateQuery);
                    }

                    participantsTable.updateParticipantStatus(participant.getParticipant_id(), "accepted");


                    stmt.close();
                    con.close();
                } else if ("rejected".equals(updatedParticipant.getStatus())) {

                    participantsTable.updateParticipantStatus(participant.getParticipant_id(), "rejected");
                }
            }

            if (updatedParticipant.getComment() != null) {
                participantsTable.updateParticipantComment(participant.getParticipant_id(), updatedParticipant.getComment());
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\":\"Participant updated successfully\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\":\"An error occurred while updating the participant\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {

            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            Incident incident = gson.fromJson(reader, Incident.class);

            if (incident != null && "finished".equalsIgnoreCase(incident.getStatus())) {

                EditParticipantsTable editParticipantsTable = new EditParticipantsTable();
                editParticipantsTable.updateParticipantsStatus(incident.getIncident_id(), "finished");

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\": \"Incident and participants updated successfully.\"}");
            } else {

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\": \"Invalid incident or status.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"An error occurred while processing the request.\"}");
        }
    }

}