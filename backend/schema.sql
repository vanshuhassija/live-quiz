Create database if not exists `quiz`;
use quiz;
Create table if not exists `teams` (
  `id` varchar(255) NOT NULL,
  `score` int(11) NOT NULL DEFAULT '0',
  `canPlay` boolean NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

Create table members (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `canPlay` boolean NOT NULL DEFAULT '1',
  `isAdmin` boolean NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

Create table questions(
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `question` varchar(255) NOT NULL,
    `code` varchar(1000) NOT NULL,
    `answer` varchar(255) NOT NULL,
    `option1`  varchar(255),
    `option2`  varchar(255),
    `option3`  varchar(255),
    `option4`  varchar(255),
    `round`  int(11) NOT NULL,
    `asked` boolean NOT NULL DEFAULT '0',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
