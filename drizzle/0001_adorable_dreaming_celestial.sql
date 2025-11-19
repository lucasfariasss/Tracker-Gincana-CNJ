CREATE TABLE `requirement_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requirement_id` int NOT NULL,
	`status` enum('pendente','em_andamento','concluido') NOT NULL DEFAULT 'pendente',
	`link_evidencia` text,
	`observacoes` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requirement_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eixo` varchar(100) NOT NULL,
	`item` text NOT NULL,
	`requisito` text NOT NULL,
	`descricao` text,
	`setor_executor` varchar(200) NOT NULL,
	`coordenador_executivo` varchar(200),
	`deadline` varchar(50),
	`pontos_aplicaveis_2026` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requirements_id` PRIMARY KEY(`id`)
);
