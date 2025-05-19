/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import mainClasses.Incident;
import com.google.gson.Gson;
import database.DB_Connection;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Mike
 */
public class EditIncidentsTable {

    public void addIncidentFromJSON(String json) throws ClassNotFoundException {
        Incident bt = jsonToIncident(json);
        if (bt.getStart_datetime()==null){
            bt.setStart_datetime();
        }
        createNewIncident(bt);
    }

    public Incident jsonToIncident(String json) {
        Gson gson = new Gson();
        Incident btest = gson.fromJson(json, Incident.class);
        return btest;
    }

    public String incidentToJSON(Incident bt) {
        Gson gson = new Gson();

        String json = gson.toJson(bt, Incident.class);
        return json;
    }

    public ArrayList<Incident> databaseToIncidents() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }
            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<Incident> databaseToIncidentsSearch(String type,String status,String municipality) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> incidents = new ArrayList<Incident>();
        ResultSet rs;
        String where="WHERE";
        if(!type.equals("all"))
            where+=" incident_type='" + type + "'";
        if(!status.equals("all")){
            if(!where.equals("WHERE")){
                where+=" and status='" + status + "'";
            }
            else{
                where+=" status='" + status + "'";
            }
        }
        if(!municipality.equals("all") && !municipality.equals("")){
            if(!where.equals("WHERE")){
                where+=" and municipality='" + municipality + "'";
            }
            else{
                where+=" municipality='" + municipality + "'";
            }
        }
        try {
            String query="SELECT * FROM incidents ";
            if(!where.equals("WHERE"))
                query+=where;
            System.out.println(query);
            rs = stmt.executeQuery(query);

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident incident = gson.fromJson(json, Incident.class);
                incidents.add(incident);
            }
            return incidents;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
/*
    public void updateIncident(String id, HashMap<String, String> updates) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        Incident bt = new Incident();
        for (String key : updates.keySet()) {
            String update = "UPDATE incidents SET " + key + "='" + updates.get(key) + "'" + "WHERE incident_id = '" + id + "'";
            stmt.executeUpdate(update);
        }
        stmt.close();
        con.close();
    }
*/
    public void updateIncident(String id, HashMap<String, String> updates) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();

        StringBuilder query = new StringBuilder("UPDATE incidents SET ");
        boolean first = true;

        for (String key : updates.keySet()) {
            if (!first) {
                query.append(", ");
            }
            query.append(key).append(" = ?");
            first = false;
        }
        query.append(" WHERE incident_id = ?");

        try (PreparedStatement pstmt = con.prepareStatement(query.toString())) {
            int i = 1;

            for (String key : updates.keySet()) {
                String value = updates.get(key);
                if (value == null || value.equalsIgnoreCase("null")) {
                    pstmt.setNull(i, java.sql.Types.NULL);
                } else {
                    pstmt.setString(i, value);
                }
                i++;
            }

            pstmt.setString(i, id);
            pstmt.executeUpdate();
        } finally {
            con.close();
        }
    }

    public void deleteIncident(String id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String deleteQuery = "DELETE FROM incidents WHERE incident_id='" + id + "'";
        stmt.executeUpdate(deleteQuery);
        stmt.close();
        con.close();
    }

    public void createIncidentsTable() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String sql = "CREATE TABLE incidents "
                + "(incident_id INTEGER not NULL AUTO_INCREMENT, "
                + "incident_type VARCHAR(10) not null,"
                + "description VARCHAR(100) not null,"
                + "user_phone VARCHAR(14) not null,"
                + "user_type VARCHAR(10)  not null, "
                + "address VARCHAR(100) not null,"
                + "lat DOUBLE, "
                + "lon DOUBLE, "
                + "municipality VARCHAR(50),"
                + "prefecture VARCHAR(15),"
                + "start_datetime DATETIME not null , "
                + "end_datetime DATETIME DEFAULT null, "
                + "danger VARCHAR (15), "
                + "status VARCHAR (15), "
                + "finalResult VARCHAR (200), "
                + "vehicles INTEGER, "
                + "firemen INTEGER, "
                + "PRIMARY KEY (incident_id ))";
        stmt.execute(sql);
        stmt.close();
        con.close();
    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void createNewIncident(Incident bt) throws ClassNotFoundException {
        
        try {
            Connection con = DB_Connection.getConnection();

            Statement stmt = con.createStatement();

            String insertQuery = "INSERT INTO "
                    + " incidents (incident_id,incident_type,"
                    + "description,user_phone,user_type,"
                    + "address,lat,lon,municipality,prefecture,start_datetime,danger,status,"
                    + "finalResult,vehicles,firemen) "
                    + " VALUES ("
                    + "'" + bt.getIncident_id() + "',"
                    + "'" + bt.getIncident_type() + "',"
                    + "'" + bt.getDescription() + "',"
                    + "'" + bt.getUser_phone() + "',"
                    + "'" + bt.getUser_type() + "',"
                    + "'" + bt.getAddress() + "',"
                    + "'" + bt.getLat() + "',"
                    + "'" + bt.getLon() + "',"
                    + "'" + bt.getMunicipality() + "',"
                    + "'" + bt.getPrefecture() + "',"
                    + "'" + bt.getStart_datetime() + "',"
                    + "'" + bt.getDanger() + "',"
                    + "'" + bt.getStatus() + "',"
                    + "'" + bt.getFinalResult() + "',"
                    + "'" + bt.getVehicles() + "',"
                    + "'" + bt.getFiremen() + "'"
                    + ")";
            //stmt.execute(table);
            System.out.println(insertQuery);
            stmt.executeUpdate(insertQuery);
            System.out.println("# The incident was successfully added in the database.");

            /* Get the member id from the database and set it to the member */
            stmt.close();

        } catch (SQLException ex) {
            Logger.getLogger(EditIncidentsTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public Incident databaseToIncident(int IncidentId) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs;

        try {
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE incident_id = " + IncidentId);
            if (rs.next()) { // Fetch only the first result
                String json = DB_Connection.getResultsToJSON(rs);
                return new Gson().fromJson(json, Incident.class);
            }
        } catch (Exception e) {
            System.err.println("Error retrieving incident with ID: " + IncidentId);
            e.printStackTrace();
        } finally {
            stmt.close();
            con.close();
        }

        return null; // Return null if no incident is found
    }

    public boolean incidentExists(String id) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        String query = "SELECT COUNT(*) AS count FROM incidents WHERE incident_id = ?";
        PreparedStatement ps = con.prepareStatement(query);
        ps.setString(1, id);

        ResultSet rs = ps.executeQuery();
        boolean exists = false;
        if (rs.next()) {
            exists = rs.getInt("count") > 0; /* if count > 0 then exists */
        }

        rs.close();
        ps.close();
        con.close();

        return exists;
    }
}
