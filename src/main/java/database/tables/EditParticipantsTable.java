/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import mainClasses.Participant;
import database.DB_Connection;

import java.sql.*;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Mike
 */
public class EditParticipantsTable {

    public void addParticipantFromJSON(String json) throws ClassNotFoundException {
        Participant r = jsonToParticipant(json);
        createNewParticipant(r);
    }

    public Participant databaseToParticipant(int id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM participants WHERE participant_id= '" + id + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            Participant bt = gson.fromJson(json, Participant.class);
            return bt;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<Participant> databaseToParticipants() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs = null;
        ArrayList<Participant> participants = new ArrayList<>();

        try {
            rs = stmt.executeQuery("SELECT * FROM participants WHERE status = 'requested'");

            if (!rs.isBeforeFirst()) {
                System.out.println("No participants found in the database.");
                return participants; // Return empty list
            }

            while (rs.next()) {
                Participant p = new Participant();
                p.setVolunteer_username(rs.getString("volunteer_username"));
                p.setIncident_id(rs.getInt("incident_id"));
                p.setStatus(rs.getString("status"));
                participants.add(p);
            }

            System.out.println("Retrieved Participants: " + participants.size());

        } catch (Exception e) {
            System.err.println("Error retrieving participants:");
            e.printStackTrace();
        } finally {
            if (rs != null) rs.close();
            stmt.close();
            con.close();
        }

        return participants;
    }

    public ArrayList<Participant> databaseToAcceptedParticipants() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs = null;
        ArrayList<Participant> acceptedParticipants = new ArrayList<>();

        try {
            rs = stmt.executeQuery("SELECT * FROM participants WHERE status = 'accepted'");

            while (rs.next()) {
                Participant p = new Participant();

                p.setParticipant_id(rs.getInt("participant_id"));
                p.setIncident_id(rs.getInt("incident_id"));
                p.setVolunteer_username(rs.getString("volunteer_username"));
                p.setVolunteer_type(rs.getString("volunteer_type"));
                p.setStatus(rs.getString("status"));
                p.setComment(rs.getString("comment"));
                acceptedParticipants.add(p);
            }

        } catch (Exception e) {
            System.err.println("Error retrieving accepted participants:");
            e.printStackTrace();
        } finally {
            if (rs != null) rs.close();
            stmt.close();
            con.close();
        }

        return acceptedParticipants;
    }

    public ArrayList<Participant> databaseToRequestedParticipants() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs = null;
        ArrayList<Participant> acceptedParticipants = new ArrayList<>();

        try {
            rs = stmt.executeQuery("SELECT * FROM participants WHERE status = 'requested'");

            while (rs.next()) {
                Participant p = new Participant();

                p.setParticipant_id(rs.getInt("participant_id"));
                p.setIncident_id(rs.getInt("incident_id"));
                p.setVolunteer_username(rs.getString("volunteer_username"));
                p.setVolunteer_type(rs.getString("volunteer_type"));
                p.setStatus(rs.getString("status"));
                p.setStatus(rs.getString("comment"));
                acceptedParticipants.add(p);
            }

        } catch (Exception e) {
            System.err.println("Error retrieving accepted participants:");
            e.printStackTrace();
        } finally {
            if (rs != null) rs.close();
            stmt.close();
            con.close();
        }

        return acceptedParticipants;
    }

    public Participant jsonToParticipant(String json) {
        Gson gson = new Gson();
        Participant r = gson.fromJson(json, Participant.class);
        return r;
    }

    public String participantToJSON(Participant r) {
        Gson gson = new Gson();

        String json = gson.toJson(r, Participant.class);
        return json;
    }

    public void acceptParticipant(int participantID, String volunteer_username) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String updateQuery = "UPDATE participants SET volunteer_username='" + volunteer_username + "', status='accepted' WHERE participant_id= '" + participantID + "'";
        stmt.executeUpdate(updateQuery);
        stmt.close();
        con.close();
    }

    public void finalStatusParticipant(int participantID, String success, String comment) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String updateQuery = "UPDATE participants SET status='finished', success='" + success + "', comment='"+
                comment+"' WHERE participant_id= '" + participantID + "'";
        stmt.executeUpdate(updateQuery);
        stmt.close();
        con.close();
    }

    public void createParticipantTable() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String sql = "CREATE TABLE participants "
                + "(participant_id INTEGER not NULL AUTO_INCREMENT, "
                + " incident_id INTEGER not NULL, "
                + " volunteer_username VARCHAR(30), "
                + " volunteer_type VARCHAR(10) not null, "
                + " status VARCHAR(15) not null, "
                + " success VARCHAR(10), "
                + " comment VARCHAR(300), "
                + "FOREIGN KEY (incident_id) REFERENCES incidents(incident_id), "
                + " PRIMARY KEY (participant_id ))";
        stmt.execute(sql);
        stmt.close();
        con.close();

    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void createNewParticipant(Participant par) throws ClassNotFoundException {
        try {
            Connection con = DB_Connection.getConnection();

            Statement stmt = con.createStatement();

            String insertQuery = "INSERT INTO "
                    + " participants (incident_id,volunteer_username,"
                    + "volunteer_type,status,success,comment)"
                    + " VALUES ("
                    + "'" + par.getIncident_id() + "',"
                    + "'" + par.getVolunteer_username()+ "',"
                    + "'" + par.getVolunteer_type() + "',"
                    + "'" + par.getStatus() + "',"
                    + "'" + par.getSuccess() + "',"
                    + "'" + par.getComment() + "'"
                    + ")";
            //stmt.execute(table);

            stmt.executeUpdate(insertQuery);
            System.out.println("# The participant was successfully added in the database.");

            /* Get the member id from the database and set it to the member */
            stmt.close();

        } catch (SQLException ex) {
            Logger.getLogger(EditParticipantsTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void updateParticipantStatus(int participantId, String status) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        try {
            String updateQuery = "UPDATE participants SET status = '" + status + "' WHERE participant_id = " + participantId;
            stmt.executeUpdate(updateQuery);
            System.out.println("Participant ID " + participantId + " updated to status: " + status);
        } catch (SQLException e) {
            System.err.println("Error updating participant status:");
            e.printStackTrace();
        } finally {
            stmt.close();
            con.close();
        }
    }

    public void updateParticipantComment(int participantId, String comment) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        try {
            String updateQuery = "UPDATE participants SET comment = '" + comment + "' WHERE participant_id = " + participantId;
            stmt.executeUpdate(updateQuery);
            System.out.println("Participant ID " + participantId + " comment updated to: " + comment);
        } catch (SQLException e) {
            System.err.println("Error updating participant comment:");
            e.printStackTrace();
        } finally {
            stmt.close();
            con.close();
        }
    }

    public void updateParticipantsStatus(int incidentId, String newStatus) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pst = null;

        try {
            String query = "UPDATE participants SET status = ? WHERE incident_id = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, newStatus);
            pst.setInt(2, incidentId);
            int updatedRows = pst.executeUpdate();
            System.out.println("Updated " + updatedRows + " participants to status: " + newStatus);
        } catch (SQLException e) {
            System.err.println("Error updating participants' status:");
            e.printStackTrace();
        } finally {
            if (pst != null) pst.close();
            con.close();
        }
    }


}