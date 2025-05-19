-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Φιλοξενητής: 127.0.0.1
-- Χρόνος δημιουργίας: 12 Νοε 2024 στις 16:12:04
-- Έκδοση διακομιστή: 10.4.11-MariaDB
-- Έκδοση PHP: 7.3.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `hy359_2024`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `incidents`
--

CREATE TABLE `incidents` (
  `incident_id` int(11) NOT NULL,
  `incident_type` varchar(10) NOT NULL,
  `description` varchar(100) NOT NULL,
  `user_phone` varchar(14) NOT NULL,
  `user_type` varchar(10) NOT NULL,
  `address` varchar(100) NOT NULL,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `municipality` varchar(50) DEFAULT NULL,
  `prefecture` varchar(15) DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `danger` varchar(15) DEFAULT NULL,
  `status` varchar(15) DEFAULT NULL,
  `finalResult` varchar(200) DEFAULT NULL,
  `vehicles` int(11) DEFAULT NULL,
  `firemen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `incidents`
--

INSERT INTO `incidents` (`incident_id`, `incident_type`, `description`, `user_phone`, `user_type`, `address`, `lat`, `lon`, `municipality`, `prefecture`, `start_datetime`, `end_datetime`, `danger`, `status`, `finalResult`, `vehicles`, `firemen`) VALUES
(1, 'fire', 'Fotia konta stis voutes', '2813407000', 'admin', 'Leof. Panepistimiou 121', 35.2975689, 25.0787173, 'Heraklion', 'Heraklion', '2024-10-25 13:33:20', NULL, 'high', 'running', 'null', 1, 5),
(2, 'accident', 'Atuxima me 2 gourounes', '6977141414', 'guest', 'El. Venizelou 170', 0, 0, 'Hersonissos', 'Heraklion', '2024-10-10 15:40:05', NULL, 'medium', 'running', 'null', 2, 3),
(3, 'fire', 'Fotia se mi katoikimeni perioxi', '6977142314', 'guest', 'Archanes-Asterousia 70100', 35.225643, 25.183435, 'Archanes-Asterousia', 'Heraklion', '2024-10-10 15:50:05', '2024-10-10 20:10:05', 'high', 'finished', 'I epixirisi itan epituximeni', 3, 7),
(4, 'accident', 'Atuxima me fortigo', '6978912345', 'user', 'Archanes-Asterousia 70100', 0, 0, 'null', 'null', '2024-08-08 10:50:05', NULL, 'unknown', 'submitted', 'null', 0, 0),
(5, 'accident', 'Atuxima me autokinita', '2813407000', 'admin', 'Leof. Knossou 17', 35.331356, 25.133087, 'Heraklion', 'Heraklion', '2024-10-25 13:33:20', NULL, 'low', 'running', 'null', 0, 0);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `incident_id` int(11) NOT NULL,
  `message` varchar(400) NOT NULL,
  `sender` varchar(50) NOT NULL,
  `recipient` varchar(50) NOT NULL,
  `date_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `messages`
--

INSERT INTO `messages` (`message_id`, `incident_id`, `message`, `sender`, `recipient`, `date_time`) VALUES
(1, 1, 'Min plisiazetai tin perioxi, dromos kleistos', 'admin', 'public', '2024-10-25 13:33:20'),
(2, 1, 'Uparxei kindunos me ladia', 'raphael', 'public', '2024-10-25 13:33:20');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `participants`
--

CREATE TABLE `participants` (
  `participant_id` int(11) NOT NULL,
  `incident_id` int(11) NOT NULL,
  `volunteer_username` varchar(30) DEFAULT NULL,
  `volunteer_type` varchar(10) NOT NULL,
  `status` varchar(15) NOT NULL,
  `success` varchar(10) DEFAULT NULL,
  `comment` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `participants`
--

INSERT INTO `participants` (`participant_id`, `incident_id`, `volunteer_username`, `volunteer_type`, `status`, `success`, `comment`) VALUES
(1, 1, 'null', 'simple', 'requested', 'null', 'null'),
(2, 1, 'null', 'driver', 'requested', 'null', 'null'),
(3, 3, 'raphael', 'driver', 'finished', 'yes', 'Voithise para polu');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` varchar(7) NOT NULL,
  `afm` varchar(10) NOT NULL,
  `country` varchar(30) NOT NULL,
  `address` varchar(100) NOT NULL,
  `municipality` varchar(50) NOT NULL,
  `prefecture` varchar(15) NOT NULL,
  `job` varchar(200) NOT NULL,
  `telephone` varchar(14) NOT NULL,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `firstname`, `lastname`, `birthdate`, `gender`, `afm`, `country`, `address`, `municipality`, `prefecture`, `job`, `telephone`, `lat`, `lon`) VALUES
(1, 'admin', 'admin@e199.gr', 'admiN12@*69', 'Admin', 'Adminakis', '1980-06-03', 'Male', '1234554321', 'Greece', 'Pl. Kiprou 5, Iraklio 713 06', 'Heraklion', 'Heraklion', 'Firemen', '2813407000', 35.3332276, 25.1162213),
(2, 'mountanton', 'mike@csd.uoc.gr', 'ab$A12cde', 'Michalis', 'Mountantonakis', '1992-06-03', 'Male', '1238585123', 'Greece', 'CSD Voutes', 'Heraklion', 'Heraklion', 'Professor', '1234567890', 35.3053121, 25.0722869),
(3, 'tsitsip', 'tsitsipas@tuc.gr', 'ab$A12cde', 'Stefanos', 'Tsitsipas', '1998-08-12', 'Male', '2525252525', 'Greece', 'Dimokratias 99', 'Heraklion', 'Heraklion', 'Twitter/Tennis', '6911111122', 35.3401097, 25.1562301),
(4, 'csdasbest', 'csdas@uoc.gr', 'ab$A12cde', 'Mary', 'Tsipaki', '1981-11-12', 'Female', '1579991110', 'Greece', 'Limenas Chersonisou', 'Hersonissos', 'Heraklion', 'compilers project manager', '6977889900', 35.318761, 25.3715371),
(5, 'tympaki', 'tympakianos@uoc.gr', 'ab$A12cde', 'Georgos', 'Niktaris', '2003-07-12', 'Male', '1179991110', 'Greece', 'I. Koriotaki', 'Faistos', 'Heraklion', 'farmer', '6977880000', 35.0722851, 24.7588403);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `volunteers`
--

CREATE TABLE `volunteers` (
  `volunteer_id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` varchar(7) NOT NULL,
  `afm` varchar(10) NOT NULL,
  `country` varchar(30) NOT NULL,
  `address` varchar(100) NOT NULL,
  `municipality` varchar(50) NOT NULL,
  `prefecture` varchar(15) NOT NULL,
  `job` varchar(200) NOT NULL,
  `telephone` varchar(14) NOT NULL,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `volunteer_type` varchar(10) NOT NULL,
  `height` double DEFAULT NULL,
  `weight` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `volunteers`
--

INSERT INTO `volunteers` (`volunteer_id`, `username`, `email`, `password`, `firstname`, `lastname`, `birthdate`, `gender`, `afm`, `country`, `address`, `municipality`, `prefecture`, `job`, `telephone`, `lat`, `lon`, `volunteer_type`, `height`, `weight`) VALUES
(1, 'raphael', 'raphael@gmail.gr', 'ab$A12cde', 'Raphael', 'Papadopoulos', '1992-08-12', 'Male', '1234567891', 'Greece', 'El. Venizelou 160, Malia', 'Hersonissos', 'Heraklion', 'taxi driver', '6988877755', 35.2836391, 25.4600817, 'driver', 1.8, 90),
(2, 'nick', 'nick@gmail.gr', 'ab$A12cde', 'Nick', 'Georgakopoulos', '1988-08-12', 'Male', '1234567891', 'Greece', 'Evans 124', 'Heraklion', 'Heraklion', 'barista', '6978912345', 35.2976896, 25.0806272, 'simple', 1.99, 112.5),
(3, 'mary', 'mary@gmail.gr', 'ab$A12cde', 'Maria', 'Vlahaki', '1992-11-12', 'Male', '8882223335', 'Greece', 'Stalida', 'Hersonissos', 'Heraklion', 'receptionist', '6977777777', 35.2908868, 25.4600817, 'simple', 1.7, 60),
(4, 'papas', 'papas@gmail.gr', 'ab$A12cde', 'Mike', 'Pappas', '1978-08-12', 'Male', '7899991112', 'Greece', 'Kondylaki 88', 'Heraklion', 'Heraklion', 'dikigoros', '6991234567', 35.3295412, 25.1185202, 'driver', 1.69, 78.5);

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `incidents`
--
ALTER TABLE `incidents`
  ADD PRIMARY KEY (`incident_id`);

--
-- Ευρετήρια για πίνακα `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `incident_id` (`incident_id`);

--
-- Ευρετήρια για πίνακα `participants`
--
ALTER TABLE `participants`
  ADD PRIMARY KEY (`participant_id`),
  ADD KEY `incident_id` (`incident_id`);

--
-- Ευρετήρια για πίνακα `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `telephone` (`telephone`);

--
-- Ευρετήρια για πίνακα `volunteers`
--
ALTER TABLE `volunteers`
  ADD PRIMARY KEY (`volunteer_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `telephone` (`telephone`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `incidents`
--
ALTER TABLE `incidents`
  MODIFY `incident_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT για πίνακα `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT για πίνακα `participants`
--
ALTER TABLE `participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT για πίνακα `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT για πίνακα `volunteers`
--
ALTER TABLE `volunteers`
  MODIFY `volunteer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`incident_id`);

--
-- Περιορισμοί για πίνακα `participants`
--
ALTER TABLE `participants`
  ADD CONSTRAINT `participants_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`incident_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
