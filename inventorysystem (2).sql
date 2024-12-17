-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 17-12-2024 a las 16:10:58
-- Versión del servidor: 8.0.30
-- Versión de PHP: 8.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inventorysystem`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loans`
--

CREATE TABLE `loans` (
  `id` int NOT NULL,
  `receivingUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `loanDate` datetime NOT NULL,
  `deliveryDate` datetime DEFAULT NULL,
  `equipmentObservations` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `dateRegister` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `loans`
--

INSERT INTO `loans` (`id`, `receivingUser`, `loanDate`, `deliveryDate`, `equipmentObservations`, `approval`, `state`, `dateRegister`) VALUES
(63, '1', '2024-12-16 15:56:00', '2024-12-19 15:56:00', NULL, 'Pendiente', 'Disponible', '2024-12-16 15:56:06'),
(64, '1', '2024-12-17 16:03:00', '2024-12-19 16:03:00', 'Buen estado.', 'Finalizado', 'Entregado en buen estado', '2024-12-16 16:03:59'),
(65, '1', '2024-12-16 16:04:00', '2024-12-20 16:04:00', 'Pantalla rota ', 'En uso', 'Ocupado', '2024-12-16 16:04:54'),
(66, '1', '2024-12-17 09:09:00', '2024-12-19 09:09:00', NULL, 'Pendiente', 'Disponible', '2024-12-17 09:09:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loan_devices`
--

CREATE TABLE `loan_devices` (
  `id` int NOT NULL,
  `loan_id` int DEFAULT NULL,
  `device_serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `device_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `loan_devices`
--

INSERT INTO `loan_devices` (`id`, `loan_id`, `device_serial`, `device_name`) VALUES
(69, 63, '12323312312', 'Notebook Azus'),
(70, 64, '12312312', 'PALA'),
(71, 65, '231232423', 'PC GAMER 50'),
(72, 66, '12312312', 'PALA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tools`
--

CREATE TABLE `tools` (
  `serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tools`
--

INSERT INTO `tools` (`serial`, `nombre`, `descripcion`, `imagen`, `estado`) VALUES
('12312312', 'PALA', 'PALA DE CONTRUCCION', 'uploads\\1729287035333.jpg', 'Disponible'),
('12323312312', 'Notebook Azus', 'Azus i9 16gb RAM', 'uploads\\1728748350893.jpg', 'Disponible'),
('124234534', 'Thinkpad', 'ThinkPad ryzen 9', 'uploads\\1728748540076.jpg', 'Disponible'),
('231232423', 'PC GAMER 50', 'FULL SATCK PC', 'uploads\\1729089056361.jpg', 'Ocupado'),
('65643453', 'Notebook', 'PC Notebook i9', 'uploads\\1728748403810.jpg', 'Disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `document` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `studentNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `isTemporaryPassword` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`document`, `name`, `email`, `phone`, `studentNumber`, `username`, `password`, `role`, `isTemporaryPassword`) VALUES
('0', 'Administrador', 'administrador@administrador.com', '0', '0', 'Administrador', '$2b$10$PJrW2l7m5G5mzAKrToFOGuEqo.mSme5CwhYXJ1/PAl6s98AK2rkD2', 'admin', 0),
('1', 'estudiante', 'esrudiante@estudiante.com', '0', '0', 'estudiante', '$2b$10$WFKnLFWjHYXWyrWYjI/4eeTzcxO1enIVbRDAj4Bxd/9uWtJghBwbC', 'student', 0),
('2', 'moderador', 'moderador@moderador.com', '0', '0', 'moderador', '$2b$10$Z5YLFRmw9MwPfIBhQkIPkuivOGEiopRETjlU37ZDlNAbtsnTW1Yyy', 'moderator', 0),
('4', 'superadmin', 'superadmin@superadmin.com', '0', '0', 'superadmin', '$2b$10$ddg5ZZ6kOnUHCsyJSDQaFOApzi3l0j0gEuIGkBwj7Vpry0LNN6116', 'superadmin', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `loan_devices`
--
ALTER TABLE `loan_devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indices de la tabla `tools`
--
ALTER TABLE `tools`
  ADD PRIMARY KEY (`serial`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`document`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `loan_devices`
--
ALTER TABLE `loan_devices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `loan_devices`
--
ALTER TABLE `loan_devices`
  ADD CONSTRAINT `loan_devices_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
