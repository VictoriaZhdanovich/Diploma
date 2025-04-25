/*
  Warnings:

  - Made the column `description` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tags` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_date` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `due_date` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `points` on table `task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assigned_user_id` on table `task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_task_id_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_task_id_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "project_team" DROP CONSTRAINT "project_team_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_team" DROP CONSTRAINT "project_team_team_id_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_assigned_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_author_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_project_id_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_task_id_fkey";

-- DropForeignKey
ALTER TABLE "task_assignment" DROP CONSTRAINT "task_assignment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team" DROP CONSTRAINT "team_product_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team" DROP CONSTRAINT "team_project_manager_user_id_fkey";

-- DropIndex
DROP INDEX "users_cognito_id_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "tags" SET NOT NULL,
ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "due_date" SET NOT NULL,
ALTER COLUMN "points" SET NOT NULL,
ALTER COLUMN "assigned_user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "role" DROP DEFAULT;
DROP SEQUENCE "users_user_id_seq";

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_product_owner_user_id_fkey" FOREIGN KEY ("product_owner_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_project_manager_user_id_fkey" FOREIGN KEY ("project_manager_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team" ADD CONSTRAINT "project_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team" ADD CONSTRAINT "project_team_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
