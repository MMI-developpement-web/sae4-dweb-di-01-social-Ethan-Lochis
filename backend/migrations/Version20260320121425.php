<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260320121425 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY `FK_D3942CE4233D34C1`');
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY `FK_D3942CE43AD8644E`');
        $this->addSql('DROP INDEX IDX_D3942CE4233D34C1 ON Subsciptions');
        $this->addSql('DROP INDEX IDX_D3942CE43AD8644E ON Subsciptions');
        $this->addSql('ALTER TABLE Subsciptions ADD follower_id INT NOT NULL, ADD following_id INT NOT NULL, DROP Following, DROP Followed, DROP PRIMARY KEY, ADD PRIMARY KEY (follower_id, following_id)');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT FK_D3942CE4AC24F853 FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT FK_D3942CE41816E3A3 FOREIGN KEY (following_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_D3942CE4AC24F853 ON Subsciptions (follower_id)');
        $this->addSql('CREATE INDEX IDX_D3942CE41816E3A3 ON Subsciptions (following_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY FK_D3942CE4AC24F853');
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY FK_D3942CE41816E3A3');
        $this->addSql('DROP INDEX IDX_D3942CE4AC24F853 ON Subsciptions');
        $this->addSql('DROP INDEX IDX_D3942CE41816E3A3 ON Subsciptions');
        $this->addSql('ALTER TABLE Subsciptions ADD Following INT NOT NULL, ADD Followed INT NOT NULL, DROP follower_id, DROP following_id, DROP PRIMARY KEY, ADD PRIMARY KEY (Following, Followed)');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT `FK_D3942CE4233D34C1` FOREIGN KEY (Followed) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT `FK_D3942CE43AD8644E` FOREIGN KEY (Following) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_D3942CE4233D34C1 ON Subsciptions (Followed)');
        $this->addSql('CREATE INDEX IDX_D3942CE43AD8644E ON Subsciptions (Following)');
    }
}
