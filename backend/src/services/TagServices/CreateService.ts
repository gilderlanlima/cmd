import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  kanban: string;
  companyId: number;
  sortOrder?: number;
  timeLane?: number;
  nextLaneId?: number;
  greetingMessageLane?: string;
  rollbackLaneId?: number;
  mediaFiles?: string;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban,
  companyId,
  sortOrder,
  timeLane = null,
  nextLaneId = null,
  greetingMessageLane = "",
  rollbackLaneId = null,
  mediaFiles = null
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  let resolvedSortOrder = sortOrder;

  if (resolvedSortOrder === undefined || resolvedSortOrder === null) {
    const lastTag = await Tag.findOne({
      where: { companyId, kanban },
      order: [["sortOrder", "DESC"], ["id", "DESC"]]
    });

    resolvedSortOrder = (lastTag?.sortOrder || 0) + 1;
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, kanban, companyId },
    defaults: {
      name, color, kanban, companyId,
      sortOrder: resolvedSortOrder,
      timeLane,
      nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
      greetingMessageLane,
      rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
      mediaFiles
    }
  });

  await tag.reload();

  return tag;
};

export default CreateService;
