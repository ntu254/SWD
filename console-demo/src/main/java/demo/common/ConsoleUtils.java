package demo.common;

public class ConsoleUtils {

    public static void printHeader(String title) {
        String line = "=".repeat(62);
        System.out.println();
        System.out.println(Colors.CYAN + Colors.BOLD + line + Colors.RESET);
        System.out.printf(Colors.CYAN + Colors.BOLD + "  %-58s%n" + Colors.RESET, title);
        System.out.println(Colors.CYAN + Colors.BOLD + line + Colors.RESET);
    }

    public static void printSubHeader(String title) {
        System.out.println();
        System.out.println(Colors.YELLOW + Colors.BOLD + "  -- " + title + " --" + Colors.RESET);
    }

    public static void printSuccess(String msg) {
        System.out.println(Colors.GREEN + "  [OK]  " + msg + Colors.RESET);
    }

    public static void printError(String msg) {
        System.out.println(Colors.RED + "  [ERR] " + msg + Colors.RESET);
    }

    public static void printInfo(String msg) {
        System.out.println(Colors.BLUE + "  [i]   " + msg + Colors.RESET);
    }

    public static void printWarning(String msg) {
        System.out.println(Colors.YELLOW + "  [!]   " + msg + Colors.RESET);
    }

    public static void printRow(String label, Object value) {
        System.out.printf("     %-25s : %s%n", Colors.bold(label), value);
    }

    public static void printSeparator() {
        System.out.println(Colors.CYAN + "  " + "-".repeat(60) + Colors.RESET);
    }

    public static void pressEnter() {
        System.out.print(Colors.yellow("\n  [Press Enter to continue...]"));
        try {
            System.in.read();
        } catch (Exception ignored) {
        }
    }
}
