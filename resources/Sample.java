/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

package ${'groupid'};
import totalcross.ui.MainWindow;
import totalcross.ui.Label;
import totalcross.sys.Settings;
public class ${'artifactid'} extends MainWindow {
    
    public ${'artifactid'}() {
        setUIStyle(Settings.MATERIAL_UI);
    }

    @Override
    public void initUI() {
        Label helloWord = new Label("Hello World!");
        add(helloWord, CENTER, CENTER);
    }
}
