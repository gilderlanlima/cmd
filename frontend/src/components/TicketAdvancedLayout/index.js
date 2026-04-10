import { styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const TicketAdvancedLayout = styled(Paper)({
    height: "100%",
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "56px 1fr"
})

export default TicketAdvancedLayout;
