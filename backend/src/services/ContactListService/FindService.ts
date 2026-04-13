import ContactList from "../../models/ContactList";

type Params = {
  companyId: string;
};

const FindService = async ({ companyId }: Params): Promise<ContactList[]> => {
  const notes: ContactList[] = await ContactList.findAll({
    where: {
      companyId
    },
    order: [["name", "ASC"]]
  });

  return notes;
};

export default FindService;
